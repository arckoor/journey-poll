<template>
	<div v-if="exists && !ended">
		<div>{{ name }}</div>
		<div v-if="voted">
			thx for voting
		</div>
		<div v-else>
			<!-- todo loading spinny boi -->
			<img
				:src="config.public.apiBase + '/images/' + image"
				alt=""
				v-for="image of images"
				:key="image"
			>
			<div v-for="idx in images.length" :key="'box'+idx">
				<input
					type="checkbox"
					name="efg"
					id="todo"
					v-model="checked[idx-1]"
				>
			</div>
			<div @click="submit">Submit</div>
		</div>
	</div>
	<div v-else-if="!exists">
		This poll doesn't exist, dummy
	</div>
	<div v-else>
		This poll is already over
	</div>
</template>

<script lang="ts">
export default defineComponent({
	data() {
		return {
			config: useRuntimeConfig(),
			name: "",
			images: new Array<string>(),
			checked: new Array<boolean>(),
			voted: false,
			id: this.$route.params.id,
			exists: true,
			ended: false
		};
	},
	async mounted() {
		this.checkVoted();
		if (!this.voted) {
			this.getPollData();
		}

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
					this.voted = data.voted;
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
					if (res.status !== 200) {
						this.exists = false;
						return;
					}
					const json = await res.json();
					if (json.ended) {
						this.ended = true;
						return;
					}
					this.name = json.name;
					this.images = json.images;
					for (let i=0; i<this.images.length; i++) {
						this.checked.push(false);
					}
				});
		},
		async submit() {
			const votes = [];
			for (let item in this.checked) {
				if (this.checked[item]) {
					votes.push(this.images[item]);
				}
			}
			await fetch(this.config.public.apiBase + "/submit/" + this.id, {
				method: "POST",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					votes: votes
				})
			});
			this.voted = true;
		},
		// https://stackoverflow.com/a/46545530/12203337
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/
		shuffle(a: Array<any>) {
			return a.map(v => ({ v, sort: Math.random() })).sort((q, s) => q.sort - s.sort).map(({ v }) => v);
		}

	}
});
</script>
