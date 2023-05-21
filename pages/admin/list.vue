<script setup lang="ts">
definePageMeta({
	layout: "admin"
});
</script>

<template>
	<div class="refresh-container">
		<Button text="Refresh" @click="getPolls" />
		<Dropdown
			class="sort-order"
			text="Sort"
			:options="sortOptions"
			:current-option="sortOrder"
			:option-change-cb="sortCallback"
		/>
	</div>
	<div v-if="sortedPolls.length > 0">
		<ListItem
			v-for="poll of sortedPolls"
			:key="poll.id"
			:name="poll.name"
			:created-by="poll.createdBy"
			:ends="ends[poll.id]"
			:expires="expires[poll.id]"
			:vote-amount="poll.voteAmount"
			:id="poll.id"
			:duplicate-callback="duplicatePoll"
			:delete-callback="enableDeletion"
		/>
	</div>
	<div v-else class="no-poll-container">
		<div class="no-poll-msg">There are no polls.</div>
		<Button text="Create one now!" @click="navigateTo('/admin/create')" />
	</div>
	<DeleteDialogue
		:deletion="deletion"
		:cancel-callback="cancelDeletion"
		:confirm-callback="confirmDeletion"
	>
		<template #deleteSlot>
			Are you sure you want to delete "{{ deletionData.name }}"? <br />
			The poll ID is {{ deletionData.id }}. <br />
			This action is not reversible.
		</template>
	</DeleteDialogue>
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
			authState: useAuth(),
			polls: new Array<Poll>(),
			sortedPolls: new Array<Poll>(),
			sortOrder: "newestFirst",
			sortOptions: {
				newestFirst: "Created - Newest",
				oldestFirst: "Created - Oldest",
				nameAscending: "Name - Ascending",
				nameDescending: "Name - Descending"
			},
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
					this.setSortOrder();
				});
		},
		setSortOrder() {
			this.sortedPolls = this.polls.slice(0);
			switch(this.sortOrder) {
				case "nameAscending":
					this.sortedPolls.sort((a, b) => {
						return ("" + a.name).localeCompare(b.name, "en", { numeric: true });
					});
					return;
				case "nameDescending":
					this.sortedPolls.sort((a, b) => {
						return -("" + a.name).localeCompare(b.name, "en", { numeric: true });
					});
					return;
				case "newestFirst":
					this.sortedPolls.reverse();
					return;
				case "oldestFirst":
					return;
			}
		},
		sortCallback(option: string) {
			if (option === this.sortOrder) return;
			this.sortOrder = option;
			this.setSortOrder();
		},
		async duplicatePoll(id: string) {
			await fetch(this.config.public.pollApiBase + "/admin/root/duplicate/" + id, {
				method: "POST",
				credentials: "include"
			});
			await this.getPolls();
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
		}
	}
});
</script>

<style scoped>
@media only screen and (max-width: 600px) {
	.button-container {
		flex-direction: column;
	}
}

.refresh-container {
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 10px 0;
}

.sort-order {
	margin-left: 20px;
}

.no-poll-container {
	padding: 50px;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.no-poll-msg {
	padding-bottom: 20px;
}

.button {
	padding: 10px 20px;
}
</style>
