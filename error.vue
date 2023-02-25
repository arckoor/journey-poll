<script setup lang="ts">
defineProps<{
	error: {
		message: string,
		statusCode: number
	}
}>();
</script>

<template>
	<div class="container">
		<div class="errorCode">{{ error.statusCode }}</div>
		<div class="message">{{error.message}}</div>
	</div>
</template>

<style scoped>
.container {
	height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
}

.errorCode {
	font-size: 300px;
}

.message {
	font-size: 80px;
}
</style>
