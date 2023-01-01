<script setup lang="ts">
definePageMeta({
	layout: "admin"
});
</script>

<template>
	<div class=refreshContainer>
		<div class="refresh button" @click="getPolls">Refresh</div>
	</div>
	<div v-if="polls.length > 0">
		<ListItem
			v-for="poll of polls"
			:key="poll.id"
			:name="poll.name"
			:countdown="countdowns[poll.id]"
			:expires="expires[poll.id]"
			:id="poll.id"
			:cb="deletePoll"
		/>
	</div>
	<div v-else class="noPoll">
		<div class="noPollMsg">There are no polls.</div>
		<NuxtLink class="button" to="/admin/create">Create one now!</NuxtLink>
	</div>
</template>

<script lang="ts">
interface Poll {
	id: string,
	name: string,
	ends: string,
	expires: string
}

export default defineComponent({
	data() {
		return {
			config: useRuntimeConfig(),
			polls: new Array<Poll>(),
			countdowns: {} as Record<string, string>,
			countdownRefs: {} as Record<string, NodeJS.Timer>,
			expires: {} as Record<string, string>,
			expireRefs: {} as Record<string, NodeJS.Timer>,
		};
	},
	async mounted() {
		await this.getPolls();
	},
	methods: {
		async getPolls() {
			await fetch(this.config.public.apiBase + "/admin/polls", {
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
						this.polls.push({
							id: item,
							...data[item]
						});
						const ref = countdown(data[item].ends, (str: string) => { this.countdowns[item] = str; });
						this.countdownRefs[item] = ref;
						const eRef = countdown(data[item].expires, (str: string) => {
							this.expires[item] = str;
							if (str === "0s") {
								this.getPolls();
							}
						});
						this.expireRefs[item] = eRef;
					}
				});
		},
		async deletePoll(id: string) {
			await fetch(this.config.public.apiBase + "/admin/delete/" + id, {
				method: "DELETE",
				credentials: "include"
			});
			clearInterval(this.countdownRefs[id]);
			delete this.countdownRefs[id];
			await this.getPolls();
		},
		destroyCountdowns() {
			for (let ct in this.countdownRefs) {
				clearInterval(ct);
			}
			for (let ct in this.expireRefs) {
				clearInterval(ct);
			}
			this.countdownRefs = {};
			this.countdowns = {};
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
	border: 2px solid var(--border);
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
</style>
