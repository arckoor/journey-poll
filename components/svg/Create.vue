<script setup lang="ts">
interface Props {
	width?: number
	height?: number
}

withDefaults(defineProps<Props>(), {
	width: 34,
	height: 34
});
</script>

<template>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 48 48"
		:height="height"
		:width="width"
	>
		<path d="M22.5 38V25.5H10v-3h12.5V10h3v12.5H38v3H25.5V38Z"/>
	</svg>
</template>

<style scoped>
svg {
	fill: var(--color-text);
}
</style>
