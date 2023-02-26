<script setup lang="ts">
defineProps<{
	name: string,
	createdBy: string,
	ends: string,
	expires: string,
	voteAmount: number,
	id: string,
	callback: (id: string, name: string) => void
}>();
const config = useRuntimeConfig();
</script>

<template>
	<div class="pollItem">
		<div class="infoSection">
			<div class="pollInfo">
				<div class="pollName">{{ name }}</div>
				<div class="timeRow">
					<div class="subscript--container">
						<div class="subscript subscript--normal">Ends in:
							<Countdown
								:date="ends"
								color-type="green"
								@timer-expired="ended = true"
								@timer-reset="ended = false"
							/>
						</div>
						<div class="subscript subscript--normal">Expires in: <Countdown :date="expires" color-type="red" /></div>
					</div>
					<div class="subscript subscript--normal">Created by: @{{ createdBy }}</div>
				</div>
			</div>
			<div class="voteAmount">Votes: {{ voteAmount }}</div>
		</div>
		<div class="linkSection">
			<Button class="linkItem" @click="copyLink(config.public.base + '/' + id)">
				<template #buttonSlot><SvgLink :width="30" :height="30" /></template>
			</Button>
			<Button class="linkItem" @click="navigateTo('/admin/edit/' + id)">
				<template #buttonSlot><SvgEdit :width="30" :height="30" /></template>
			</Button>
			<Button class="linkItem" @click="navigateTo('/admin/results/' + id)">
				<template #buttonSlot><SvgResults :width="30" :height="30" /></template>
			</Button>
			<Button class="linkItem delete" @click="callback(id, name)">
				<template #buttonSlot><SvgDelete :width="30" :height="30" /></template>
			</Button>
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
@media only screen and (max-width: 740px) {
	.pollItem {
		padding: 2px 10px 2px 20px;
		margin: 20px 10px 10px 10px;
		flex-direction: row;
		align-items: flex-start;
		justify-content: flex-start;
	}
	.linkSection {
		flex-direction: column;
		margin: 10px 0;
	}
}

@media only screen and (max-width: 830px) {
	.infoSection {
		flex-direction: column;
	}
	.voteAmount {
		margin: 10px 0 0 0;
	}
	.pollInfo {
		width: 100%;
	}
}

@media only screen and (min-width: 741px) {
	.pollItem {
		padding: 20px 50px 20px 50px;
		margin: 20px 50px 10px 50px;
		flex-direction: row;
		justify-content: space-between;
	}
}

@media only screen and (min-width: 831px) {
	.voteAmount {
		text-align: center;
	}
}

@media only screen and (max-width: 1304px) {
	.subscript--container,
	.timeRow {
		flex-direction: column;
	}
	.voteAmount{
		width: 100%;
	}
}

@media only screen and (min-width: 1305px) {
	.subscript--container,
	.infoSection,
	.linkSection {
		flex-direction: row;
	}
}

@media only screen and (max-width: 1599px) {
	.timeRow {
		flex-direction: column;
	}
}

@media only screen and (min-width: 1600px) {
	.timeRow {
		flex-direction: row;
	}
}

.pollItem {
	display: flex;
	border: 2px solid var(--color-background--layer-10);
	align-items: center;
}

.pollInfo {
	display: flex;
	flex-direction: column;
}

.subscript--container,
.timeRow {
	display: flex;
}

.infoSection {
	display: flex;
	width: 100%;
	justify-content: space-between;
	align-items: center;
}

.subscript {
	font-size: var(--font-size--subscript);
	min-width: 205px;
}

.subscript--normal {
	color: var(--color-text--disabled)
}

.linkItem {
	padding: 10px 10px;
	margin: 5px;
}

.pollName {
	font-size: var(--font-size--content);
}

.voteAmount {
	white-space: nowrap;
	flex-basis: 50%;
}

.linkSection {
	flex-basis: content;
	display: flex;
	justify-content: right;
	align-items: center;
}

.delete:hover {
	background-color: var(--color-primary--hover);
}
</style>
