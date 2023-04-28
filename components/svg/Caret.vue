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
		viewBox="0 96 960 960"
		:height="height"
		:width="width"
	>
		<path d="M480 696 280 496h400L480 696Z"/>
	</svg>
</template>

<style scoped>
svg {
	fill: var(--color-text);
}
</style>
