<script setup lang="ts">
definePageMeta({
	layout: "admin"
});
</script>

<template>
	<div class=refreshContainer>
		<Button class="refresh" text="Refresh" @click="getPolls" />
	</div>
	<div v-if="polls.length > 0">
		<ListItem
			v-for="poll of polls"
			:key="poll.id"
			:name="poll.name"
			:created-by="poll.createdBy"
			:ends="ends[poll.id]"
			:expires="expires[poll.id]"
			:vote-amount="poll.voteAmount"
			:id="poll.id"
			:callback="enableDeletion"
		/>
	</div>
	<div v-else class="noPoll">
		<div class="noPollMsg">There are no polls.</div>
		<Button text="Create one now!" @click="navigateTo('/admin/create')" />
	</div>
	<div :class="'deleteBG' + (deletion ? ' deleteContainer' : ' deleteHide')">
		<div class="deleteText">
			Are you sure you want to delete "{{ deletionData.name }}"? <br />
			The poll ID is {{ deletionData.id }}. <br />
			This action is not reversible.
		</div>
		<div class="buttonContainer">
			<Button class="deleteButton" text="No, take me back." @click="cancelDeletion" />
			<Button class="deleteButton deleteConfirm" text="Yes, delete!" @click="confirmDeletion" />
		</div>
	</div>
</template>

<script lang="ts">
interface Poll {
	id: string
	createdBy: string
	name: string
	ends: string
	expires: string
	voteAmount: number
}

export default defineComponent({
	data() {
		return {
			config: useRuntimeConfig(),
			polls: new Array<Poll>(),
			ends: {} as Record<string, string>,
			expires: {} as Record<string, string>,
			deletion: false,
			deletionData: {} as Record<string, string>
		};
	},
	async mounted() {
		await this.getPolls();
	},
	methods: {
		async getPolls() {
			await fetch(this.config.public.pollApiBase + "/admin/polls", {
				method: "GET",
				credentials: "include",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
			})
				.then(async res => {
					const data = await res.json();
					this.polls = [];
					for (let item in data) {
						this.ends[item] = data[item].ends;
						this.expires[item] = data[item].expires;
						this.polls.push({
							id: item,
							...data[item]
						});
					}
				});
		},
		enableDeletion(id: string, name: string) {
			this.deletion = true;
			this.deletionData = {
				id: id,
				name: name
			};
		},
		cancelDeletion() {
			this.deletion = false;
			this.deletionData = {};
		},
		confirmDeletion() {
			this.deletePoll(this.deletionData.id);
			this.deletion = false;
			this.deletionData = {};
		},
		async deletePoll(id: string) {
			await fetch(this.config.public.pollApiBase + "/admin/delete/" + id, {
				method: "DELETE",
				credentials: "include"
			});
			await this.getPolls();
		},
	}
});
</script>

<style scoped>
@media only screen and (max-width: 600px) {
	.buttonContainer {
		flex-direction: column;
	}
}

.refreshContainer {
	display: flex;
	justify-content: center;
	align-items: center;
}

.refresh {
	margin: 10px 0;
	padding: 10px 20px 10px 20px;
	border-radius: 5px;
	width: fit-content;
	cursor: pointer;
}

.noPoll {
	padding: 50px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.noPollMsg {
	padding-bottom: 20px;
}

.button {
	padding: 10px 20px;
}

.deleteHide {
	visibility: hidden;
	opacity: 0;
	max-height: 0;
}

.deleteBG {
	background-color: transparent
}

.deleteContainer {
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

.deleteText {
	font-size: var(--font-size--content-large);
	text-align: center;
}

.buttonContainer {
	display: flex;
	width: 500px;
	justify-content: center;
	align-items: center;
}

.deleteButton {
	width: 200px;
	margin: 40px 20px 0 20px;
}

.deleteConfirm {
	border-color: var(--color-primary--hover);
	transition: background var(--transition-short);
}

.deleteConfirm:hover {
	background-color: var(--color-primary--hover);
}
</style>
