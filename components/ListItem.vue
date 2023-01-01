<script setup lang="ts">
defineProps<{
	name: string,
	countdown: string,
	expires: string,
	id: string,
	cb: (id: string) => void
}>();
const config = useRuntimeConfig();
</script>

<template>
	<div class="pollItem">
		<div class="pollName">{{ name }}</div>
		<div :class="'pollEnd' + (countdown === '0s' ? ' green' : '')">Ends in: {{ countdown }}</div>
		<div :class="'pollEnd' + (new RegExp(/^[0-9]*m|^[0-9]*s/).test(expires) ? ' red' : '')">Expires in: {{ expires }}</div>
		<div class="linkSection">
			<div class="linkItem button" @click="copyLink(config.public.base + '/' + id)">Click to copy link</div>
			<div class="linkItem button" @click="navigateTo('/admin/results/' + id)">Results</div>
			<div class="linkItem button delete" @click="cb(id)">Delete</div>
		</div>
	</div>
</template>

<style scoped>
.pollItem {
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	padding: 20px 50px 20px 50px;
	margin: 20px 50px 10px 50px;
	border: 2px solid var(--border);
	align-items: center;
}

.linkItem {
	padding: 10px 10px;
	margin: 0 5px;
}

.pollName {
	flex-basis: 40%;
	font-size: 24px;
}

.pollEnd {
	flex-basis: 15%;
}

.linkSection {
	flex-basis: 30%;
	display: flex;
	flex-direction: row;
	justify-content: right;
	align-items: center;
}


.delete:hover {
	background-color: var(--danger);
}
</style>
