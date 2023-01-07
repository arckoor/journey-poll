<script setup lang="ts">
defineProps<{
	name: string,
	ends: string,
	expires: string,
	voteAmount: number,
	id: string,
	cb: (id: string, name: string) => void
}>();
const config = useRuntimeConfig();
</script>

<template>
	<div class="pollItem">
		<div class="pollName">{{ name }}</div>
		<div :class="'pollEnd' + (ends === '0s' ? ' green' : '')">Ends in: {{ ends }}</div>
		<div :class="'pollEnd' + (new RegExp(/^[0-9]*m|^[0-9]*s/).test(expires) ? ' red' : '')">Expires in: {{ expires }}</div>
		<div class="voteAmount">Votes: {{ voteAmount }}</div>
		<div class="linkSection">
			<Button class="linkItem" text="Click to copy link" @click="copyLink(config.public.base + '/' + id)" />
			<Button class="linkItem" text="Edit" @click="navigateTo('/admin/edit/' + id)" />
			<Button
				class="linkItem"
				text="Results"
				@click="navigateTo('/admin/results/' + id)"
				:disabled="ends != '0s'"
			/>
			<Button class="linkItem delete" text="Delete" @click="cb(id, name)" />
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
	border: 2px solid var(--color-background--layer-10);
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

.voteAmount {
	flex-basis: 7%;
}

.linkSection {
	flex-basis: 30%;
	display: flex;
	flex-direction: row;
	justify-content: right;
	align-items: center;
}

.delete:hover {
	background-color: var(--color-primary--hover);
}
</style>
