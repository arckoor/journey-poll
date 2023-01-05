<template>
	<div v-if="ready">
		<Vote :status="status" :data="data" v-if="vote" />
		<Results :base="config.public.apiBase" v-else/>
	</div>
</template>

<script lang="ts">
export default defineComponent({
	data() {
		return {
			config: useRuntimeConfig(),
			id: this.$route.params.id,
			status: 0,
			data: {} as Record<string, string | Array<string>>,
			vote: true,
			ready: false
		};
	},
	async mounted() {
		await this.checkVoted();
		await this.getPollData();
	},
	methods: {
		async checkVoted() {
			await fetch(this.config.public.apiBase + "/submit/" + this.id, {
				method: "GET",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
			})
				.then(async res => {
					const data = await res.json();
					this.data.voted = data.voted;
				});

		},
		async getPollData() {
			await fetch(this.config.public.apiBase + "/poll/" + this.id, {
				method: "GET",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
			})
				.then(async res => {
					this.status = res.status;
					if (res.status === 200) {
						const json = await res.json();
						this.data = { ...this.data, ...json };
						if (json.ended) {
							this.vote = false;
						}
					}
					this.ready = true;
				});
		}

	}
});
</script>
