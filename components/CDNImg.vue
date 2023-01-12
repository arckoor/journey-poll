<script setup lang="ts">
defineProps<{
	src: string,
	alt: string,
	fromClient?: boolean
}>();

</script>

<template>
	<img
		v-if="fromClient"
		:alt="alt"
		:src="src"
	>
	<img
		v-else
		:src="config.public.apiBase + '/images/' + src"
		:srcset="srcset"
		:alt="alt"
	>
</template>

<script lang="ts">
export default defineComponent({
	data() {
		return {
			config: useRuntimeConfig(),
			srcset: "",
		};
	},
	mounted() {
		if (!this.fromClient && !this.config.public.dev) {
			this.srcset = `
				${this.config.public.apiBase}/cdn-cgi/image/fit=contain,width=320/poll/images/${this.src}   320w,
				${this.config.public.apiBase}/cdn-cgi/image/fit=contain,width=640/poll/images/${this.src}   640w,
				${this.config.public.apiBase}/cdn-cgi/image/fit=contain,width=960/poll/images/${this.src}   960w,
				${this.config.public.apiBase}/cdn-cgi/image/fit=contain,width=1280/poll/images/${this.src} 1280w,
				${this.config.public.apiBase}/cdn-cgi/image/fit=contain,width=2560/poll/images/${this.src} 2560w
			`;
		}
	}
});
</script>
