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
			:ends="ends[poll.id]"
			:expires="expires[poll.id]"
			:vote-amount="poll.voteAmount"
			:id="poll.id"
			:cb="enableDeletion"
		/>
	</div>
	<div v-else class="noPoll">
		<div class="noPollMsg">There are no polls.</div>
		<NuxtLink class="button" to="/admin/create">Create one now!</NuxtLink>
	</div>
	<div :class="'deleteBG ' + (deletion ? 'deleteContainer' : ' deleteHide')">
		<div class="deleteText">
			Are you sure you want to delete "{{ deletionData.name }}"? <br />
			The poll ID is {{ deletionData.id }}. <br />
			This action is not reversible.
		</div>
		<div class="buttonContainer">
			<div class="button deleteButton" @click="cancelDeletion">No, take me back.</div>
			<div class="button deleteButton deleteConfirm" @click="confirmDeletion">Yes, delete!</div>
		</div>
	</div>
</template>

<script lang="ts">
interface Poll {
	id: string,
	name: string,
	ends: string,
	expires: string,
	voteAmount: number
}

export default defineComponent({
	data() {
		return {
			config: useRuntimeConfig(),
			polls: new Array<Poll>(),
			ends: {} as Record<string, string>,
			endRefs: {} as Record<string, NodeJS.Timer>,
			expires: {} as Record<string, string>,
			expireRefs: {} as Record<string, NodeJS.Timer>,
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
					this.destroyCountdowns();
					const data = await res.json();
					this.polls = [];
					for (let item in data) {
						this.ends[item] = "";
						this.expires[item] = "";
						const ref = countdown(data[item].ends, (str: string) => {
							this.ends[item] = str;
						});
						this.endRefs[item] = ref;
						const eRef = countdown(data[item].expires, (str: string) => {
							this.expires[item] = str;
							if (str === "0s") {
								this.getPolls();
							}
						});
						this.expireRefs[item] = eRef;

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
			clearInterval(this.endRefs[id]);
			delete this.endRefs[id];
			await this.getPolls();
		},
		destroyCountdowns() {
			for (let ct in this.endRefs) {
				clearInterval(ct);
			}
			for (let ct in this.expireRefs) {
				clearInterval(ct);
			}
			this.endRefs = {};
			this.ends = {};
			this.expireRefs = {};
			this.expires = {};
		}
	}
});
</script>

<style scoped>
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
	transition: background-color var(--delete-transition);
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
	font-size: 30px;
	text-align: center;
}

.buttonContainer {
	display: flex;
	width: 500px;
}

.deleteButton {
	width: 200px;
	margin: 40px 20px 0 20px;
}

.deleteConfirm {
	border-color: var(--color-primary--hover);
	transition: background var(--hover-transition);
}

.deleteConfirm:hover {
	background-color: var(--color-primary--hover);
}
</style>
