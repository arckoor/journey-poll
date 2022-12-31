<script setup lang="ts">
definePageMeta({
	layout: "admin"
});
</script>

<template>
	<div v-if="polls.length > 0">
		<div v-for="poll of polls" :key="poll.id">
			<div>{{ poll.name }}</div>
			<div>Ends: {{ poll.ends }}</div>
			<div @click="copyLink(config.public.base + '/' + poll.id)">Link: {{ poll.id }}</div>
			<div @click="navigateTo('/admin/results/' + poll.id)">Results</div>
			<div @click="deletePoll(poll.id)">Delete</div>
		</div>
	</div>
	<div v-else>
		There are no polls.
		<NuxtLink to="/admin/create">Create one now!</NuxtLink>
	</div>
	<div @click="getPolls">Refresh</div>
</template>

<script lang="ts">
interface Poll {
	id: string,
	ends: string,
	name: string
}


export default defineComponent({
	data() {
		return {
			config: useRuntimeConfig(),
			polls: new Array<Poll>()
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
					const data = await res.json();
					this.polls = [];
					for (let item in data) {
						this.polls.push({
							id: item,
							...data[item]
						});
					}
				});
		},
		async deletePoll(id: string) {
			await fetch(this.config.public.apiBase + "/admin/delete/" + id, {
				method: "DELETE",
				credentials: "include"
			});
			await this.getPolls();
		}
	}
});
</script>
