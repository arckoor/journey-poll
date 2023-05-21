<script setup lang="ts">
defineProps<{
	name: string,
	createdBy: string,
	ends: string,
	expires: string,
	voteAmount: number,
	id: string,
	duplicateCallback: (id: string) => void,
	deleteCallback: (id: string, name: string) => void
}>();
const config = useRuntimeConfig();
</script>

<template>
	<div class="item">
		<div class="info">
			<div class="poll-info">
				<div class="poll-name">{{ name }}</div>
				<div class="poll-time">
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
			<div class="poll-votes">Votes: {{ voteAmount }}</div>
		</div>
		<div class="link">
			<Button class="link-item" @click="copyLink(config.public.base + '/' + id)">
				<template #buttonSlot><SvgLink :width="30" :height="30" /></template>
			</Button>
			<Button class="link-item" @click="navigateTo('/admin/edit/' + id)">
				<template #buttonSlot><SvgEdit :width="30" :height="30" /></template>
			</Button>
			<Button class="link-item" @click="duplicateCallback(id)" v-if="authState.root">
				<template #buttonSlot><SvgDuplicate :width="30" :height="30" /></template>
			</Button>
			<Button class="link-item" @click="navigateTo('/admin/results/' + id)">
				<template #buttonSlot><SvgResults :width="30" :height="30" /></template>
			</Button>
			<Button class="link-item delete" @click="deleteCallback(id, name)">
				<template #buttonSlot><SvgDelete :width="30" :height="30" /></template>
			</Button>
		</div>
	</div>
</template>

<script lang="ts">
export default defineComponent({
	data() {
		return {
			ended: false,
			authState: useAuth()
		};
	}
});
</script>

<style scoped>
@media only screen and (max-width: 740px) {
	.item {
		padding: 2px 10px 2px 20px;
		margin: 20px 10px 10px 10px;
		flex-direction: row;
		align-items: flex-start;
		justify-content: flex-start;
	}
	.link {
		flex-direction: column;
		margin: 10px 0;
	}
}

@media only screen and (max-width: 830px) {
	.info {
		flex-direction: column;
	}
	.poll-votes {
		margin: 10px 0 0 0;
	}
	.poll-info {
		width: 100%;
	}
}

@media only screen and (min-width: 741px) {
	.item {
		padding: 20px 50px 20px 50px;
		margin: 20px 50px 10px 50px;
		flex-direction: row;
		justify-content: space-between;
	}
}

@media only screen and (min-width: 831px) {
	.poll-votes {
		text-align: center;
	}
}

@media only screen and (max-width: 1304px) {
	.subscript--container,
	.poll-time {
		flex-direction: column;
	}
	.poll-votes {
		width: 100%;
	}
}

@media only screen and (min-width: 1305px) {
	.subscript--container,
	.info,
	.link {
		flex-direction: row;
	}
}

@media only screen and (max-width: 1599px) {
	.poll-time {
		flex-direction: column;
	}
}

@media only screen and (min-width: 1600px) {
	.poll-time {
		flex-direction: row;
	}
}

.item {
	display: flex;
	border: 2px solid var(--color-background--layer-10);
	align-items: center;
}

.poll-info {
	display: flex;
	flex-direction: column;
}

.subscript--container,
.poll-time {
	display: flex;
}

.info {
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

.link-item {
	padding: 10px 10px;
	margin: 5px;
}

.poll-name {
	font-size: var(--font-size--content);
}

.poll-votes {
	white-space: nowrap;
	flex-basis: 50%;
}

.link {
	flex-basis: content;
	display: flex;
	justify-content: right;
	align-items: center;
}

.delete:hover {
	background-color: var(--color-primary--hover);
}
</style>
