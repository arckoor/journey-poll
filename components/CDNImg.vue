<script setup lang="ts">
defineProps<{
	src: string,
	alt: string,
	sizes: string,
	fromClient?: boolean
}>();

</script>

<template>
	<img
		:src="srcMod"
		:srcset="srcset"
		:alt="alt"
		:sizes="sizes"
	>
</template>

<script lang="ts">
export default defineComponent({
	data() {
		return {
			config: useRuntimeConfig(),
			srcset: "",
			srcMod: this.src
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
	}
});
</script>
