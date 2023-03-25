<script setup lang="ts">
interface Props {
	number: number,
	width?: number
	height?: number
}

withDefaults(defineProps<Props>(), {
	width: 34,
	height: 34
});
</script>

<template>
	<!-- made by banj -->
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 100 100"
		:height="height"
		:width="width"
		:class="'no-select ' + ['fill-gold', 'fill-silver', 'fill-bronze'][number-1]"
	>
		<path  d="M62,46.07V42a3,3,0,0,0-3-3H41a3,3,0,0,0-3,3v4.07a25,25,0,1,0,24,0ZM50,89A21,21,0,1,1,71,68,21,21,0,0,1,50,89Z"/>
		<polygon points="50 36 40 36 25 22.76 25 13.94 50 36"/>
		<polygon points="75 13.94 75 22.76 60 36 50 36 75 13.94"/>
		<text style="font-size: 27px" transform="translate(42.5 77)">{{ number }}</text>
	</svg>
</template>

<style scoped>
svg {
	fill: var(--color-text);
}

.fill-gold {
	fill: var(--color-accent--gold);
}

.fill-silver {
	fill: var(--color-accent--silver);
}

.fill-bronze {
	fill: var(--color-accent--bronze);
}
</style>
