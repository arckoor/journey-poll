<script setup lang="ts">
definePageMeta({
	layout: "admin"
});
</script>

<template>
	<div>{{ "Winner" + (winners.length > 1 ? "s" : "") + ":"}}</div>
	<img
		:src="config.public.apiBase + '/images/' + image"
		alt=""
		v-for="image of winners"
		:key="image"
	>
</template>

<script lang="ts">
export default defineComponent({
	data() {
		return {
			config: useRuntimeConfig(),
			id: this.$route.params.id,
			max: 0,
			winners: new Array<string>()
		};
	},
	mounted() {
		this.showResults();
	},
	methods: {
		async showResults() {
			await fetch(this.config.public.apiBase + "/admin/results/" + this.id, {
				method: "GET",
				credentials: "include",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				}
			}).then(async res => {
				const data = await res.json();
				for (let item in data.votes) {
					if (data.votes[item] > this.max) {
						this.max = data.votes[item];
					}
				}
				for (let item in data.votes) {
					if (data.votes[item] === this.max) {
						this.winners.push(this.getExtension(item, data.images));
					}
				}
			});
		},
		getExtension(key: string, images: Array<string>) {
			let result = "";
			for (let item of images) {
				if (item.replace( /\.[^/.]+$/, "") === key) {
					result = item;
				}
			}
			return result;
		}
	}
});

</script>
