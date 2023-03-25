<script setup lang="ts">
defineProps<{
	src: string,
	alt: string,
	sizes: string,
	borderColor?: string,
	aspectRatio?: string,
	fromClient?: boolean,
	clickDisabled?: boolean
}>();
</script>

<template>
	<div class="no-select center">
		<img
			class="img-small"
			:src="srcMod"
			:srcset="srcset"
			:alt="alt"
			:sizes="sizes"
			@click="makeBig"
			@dragstart.prevent
			loading="lazy"
			:style="aspectStyle + ' --accent-color: ' + borderStyle + ';'"
		>
		<div class="big-container" v-if="big" @click="makeSmall">
			<div :class="bigClass">
				<img
					v-if="big"
					class="img-fullscreen"
					:src="srcMod"
					:alt="alt"
					@dragstart.prevent
					loading="lazy"
					style="--accent-color: var(--color-accent--border);"
				>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
export default defineComponent({
	data() {
		return {
			config: useRuntimeConfig(),
			srcset: "",
			srcMod: this.src,
			big: false,
			bigClass: "big-fullscreen big-fullscreen--hide",
			aspectStyle: "",
			borderStyle: ""
		};
	},
	mounted() {
		if (["gold", "silver", "bronze"].includes(this.borderColor || "")) { // if specified, it's (hopefully) one of these
			this.borderStyle = {
				"gold": "var(--color-accent--gold)",
				"silver": "var(--color-accent--silver)",
				"bronze": "var(--color-accent--bronze)"
			}[this.borderColor as string] as string;
		} else {
			this.borderStyle = "var(--color-accent--border)"; // if not just use the default
		}
		if (!this.fromClient) { // this sets the aspect ratio to reduce layout shifting
			this.srcMod = this.config.public.pollApiBase + "/images/" + this.src;
			this.aspectStyle = "aspect-ratio: " + this.aspectRatio + "; --ratio: " + this.aspectRatio + ";";
		}
		if (!this.fromClient && !this.config.public.dev) { // srcset to reduce bandwidth in production
			const pre = this.config.public.apiBase + "/cdn-cgi/image";
			const common = "fit=scale-down,format=auto,quality=lossless,metadata=none,onerror=redirect";
			const post = "poll/images/" + this.src;
			this.srcset = `
				${pre}/${common},width=320/${post}   320w,
				${pre}/${common},width=640/${post}   640w,
				${pre}/${common},width=960/${post}   960w,
				${pre}/${common},width=1280/${post} 1280w,
				${pre}/${common},width=1920/${post} 1920w,
				${pre}/${common},width=2560/${post} 2560w
			`;
		}
	},
	methods: {
		makeBig() {
			if (this.clickDisabled) return;
			this.big = true;
			setTimeout(() => { this.bigClass = "big-fullscreen"; });
		},
		makeSmall() {
			if (this.clickDisabled) return;
			this.big = false;
			this.bigClass = "big-fullscreen big-fullscreen--hide";
		}
	}
});
</script>

<style scoped>
.center {
	display: flex;
	justify-content: center;
}

img {
	/* https://stackoverflow.com/a/65705018/12203337 */
	--width: calc(100% - var(--image-width--border));
	--height: 95vh;
	border: var(--image-width--border) solid var(--accent-color);
	width: var(--width);
	max-width: min(var(--width), calc(var(--height) * var(--ratio)));
	object-fit: contain;
	display: block;
}

.img-small {
	cursor: pointer;
	transition: box-shadow .2s;
}

.img-small:hover {
	box-shadow: 0px 0px 20px var(--accent-color);
}

.big-container {
	cursor: pointer;
}

.big-fullscreen {
	position: fixed;
	top: 0;
	left: 0;
	height: 100%;
	width: 100%;
	background-color: var(--color-background--layer-50);
	display: flex;
    justify-content: center;
    align-items: center;
	flex-direction: column;
	transition: opacity var(--transition-short);
	z-index: 999;
}

.big-fullscreen--hide {
	opacity: 0;
}

.img-fullscreen {
	max-width: 90vw;
	max-height: 95vh;
	height: auto;
	width: auto;
}
</style>
