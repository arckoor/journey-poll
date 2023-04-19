<template>
	<div v-if="ready">
		<Vote :data="data" v-if="vote" />
		<Results :base="config.public.pollApiBase" v-else/>
	</div>
</template>

<script lang="ts">
import { showError } from "#app";

export default defineComponent({
	data() {
		return {
			config: useRuntimeConfig(),
			id: this.$route.params.id,
			data: {} as Record<string, string | Array<string>>,
			vote: true,
			ready: false
		};
	},
	async mounted() {
		await this.getPollData();
	},
	methods: {
		async getPollData() {
			await fetch(this.config.public.pollApiBase + "/poll/" + this.id, {
				method: "GET",
				credentials: "include",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
			})
				.then(async res => {
					if (res.status === 404) {
						showError({ message: "This poll doesn't exist :/", statusCode: 404 });
					}
					if (res.status === 200) {
						const json = await res.json();
						this.data = { ...this.data, ...json };
						if (json.ended) {
							this.vote = false;
						}
						this.ready = true;
					}
				});
		}
	}
});
</script>
