<script setup lang="ts">
defineProps<{
	src: string,
	alt: string,
	sizes: string,
	fromClient?: boolean
}>();

</script>

<template>
	<div>
		<img
			class="img-small"
			:src="srcMod"
			:srcset="srcset"
			:alt="alt"
			:sizes="sizes"
			@click="makeBig"
			@dragstart.prevent
		>
		<div class="big-container" v-if="big" @click="makeSmall">
			<div :class="bigClass">
				<img
					v-if="big"
					class="img-fullscreen"
					:src="srcMod"
					:alt="alt"
					@dragstart.prevent
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
			bigClass: "big-fullscreen big-fullscreen--hide"
		};
	},
	mounted() {
		if (!this.fromClient) {
			this.srcMod = this.config.public.pollApiBase + "/images/" + this.src;
		}
		if (!this.fromClient && !this.config.public.dev) {
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
			this.big = true;
			setTimeout(() => { this.bigClass = "big-fullscreen"; });
		},
		makeSmall() {
			this.big = false;
			this.bigClass = "big-fullscreen big-fullscreen--hide";
		}
	}
});
</script>

<style scoped>
img {
	border: var(--image-width--border) solid var(--color-accent--border);
}

.img-small {
	width: 100%;
	height: 100%;
	cursor: pointer;
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
