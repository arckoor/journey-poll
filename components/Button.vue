<script setup lang="ts">
interface Props {
	text?: string
	disabled?: boolean
}

withDefaults(defineProps<Props>(), {
	disabled: false
});
</script>

<template>
	<div :class="'button no-select' + (disabled ? ' disabled' : '')">
		{{ text }}
		<div class="slot" v-if="$slots.buttonSlot"><slot name="buttonSlot" ></slot></div>
	</div>
</template>

<style scoped>
.disabled {
	color: var(--color-text--disabled);
	pointer-events: none;
}

.button {
	text-align: center;
	cursor: pointer;
	border-radius: 5px;
	border: 2px solid var(--color-background--layer-10);
	transition: border-color var(--transition-short),
		color var(--transition-short),
		background-color var(--transition-short);
	padding: 10px 20px;
}

.button:hover {
	border-color: var(--color-primary--hover)
}

.slot {
	display: flex;
	justify-content: center;
	align-items: center;
}
</style>
