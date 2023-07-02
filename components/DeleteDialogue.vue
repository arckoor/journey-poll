<script setup lang="ts">
defineProps<{
	deletion: boolean,
	cancelCallback: () => void,
	confirmCallback: () => void
}>();
</script>

<template>
	<div :class="'delete-bg' + (deletion ? ' delete-container' : ' delete--hide')">
		<div class="delete-text">
			<slot name="deleteSlot"></slot>
		</div>
		<div class="button-container">
			<Button class="delete-button" text="No, take me back." @click="cancelCallback" />
			<Button class="delete-button delete-confirm" text="Yes, delete!" @click="confirmCallback" />
		</div>
	</div>
</template>

<style scoped>
@media only screen and (max-width: 599px) {
	.button-container {
		flex-direction: column;
	}
}

.delete-container {
	z-index: 9999;
	transition: background-color var(--transition-middle);
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
	visibility: visible;
	opacity: 1;
}

.delete--hide {
	visibility: hidden;
	opacity: 0;
	max-height: 0;
}

.delete-text {
	font-size: var(--font-size--content-large);
	text-align: center;
}

.button-container {
	display: flex;
	width: 500px;
	justify-content: center;
	align-items: center;
}

.delete-button {
	width: fit-content;
	min-width: 200px;
	margin: 40px 20px 0 20px;
}

.delete-confirm {
	border-color: var(--color-primary--hover);
	transition: background var(--transition-short);
}

.delete-confirm:hover {
	background-color: var(--color-primary--hover);
}
</style>
