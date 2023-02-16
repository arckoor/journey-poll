<script setup lang="ts">
defineProps<{
	name: string,
	createdBy: string,
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
		<div class="pollInfo">
			<div class="pollName">{{ name }}</div>
			<div class="timeRow">
				<div class="subscript subscript--normal">Ends in:
					<Countdown
						:date="ends"
						color-type="green"
						@timer-expired="ended = true"
						@timer-reset="ended = false"/>
				</div>
				<div class="subscript subscript--normal">Expires in: <Countdown :date="expires" color-type="red" /></div>
				<div class="subscript subscript--normal">Created by: @{{ createdBy }}</div>
			</div>
		</div>
		<div class="voteAmount">Votes: {{ voteAmount }}</div>
		<div class="linkSection">
			<Button class="linkItem" text="Click to copy link" @click="copyLink(config.public.base + '/' + id)" />
			<Button class="linkItem" text="Edit" @click="navigateTo('/admin/edit/' + id)" />
			<Button class="linkItem" text="Results" @click="navigateTo('/admin/results/' + id)" />
			<Button class="linkItem delete" text="Delete" @click="cb(id, name)" />
		</div>
	</div>
</template>

<script lang="ts">
export default defineComponent({
	data() {
		return {
			ended: false
		};
	}
});
</script>

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

.pollInfo {
	display: flex;
	flex-direction: column;
}

.timeRow {
	display: flex;
	flex-direction: row;
}

.subscript {
	font-size: var(--font-size--subscript);
	margin-right: 20px;
	min-width: 205px;
}

.subscript--normal {
	color: var(--color-text--disabled)
}

.linkItem {
	padding: 10px 10px;
	margin: 0 5px;
	flex-basis: content;
}

.pollName {
	flex-basis: 40%;
	font-size: var(--font-size--content);
}

.voteAmount {
	flex-basis: 7%;
}

.linkSection {
	flex-basis: content;
	display: flex;
	flex-direction: row;
	justify-content: right;
	align-items: center;
}

.delete:hover {
	background-color: var(--color-primary--hover);
}
</style>
