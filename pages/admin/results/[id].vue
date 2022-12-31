<script setup lang="ts">
definePageMeta({
	layout: "admin"
});
</script>

<template>
	<div v-if="ended">
		<div class="winnerContainer">
			<div class="heading">{{ "Winner" + (winners.length > 1 ? "s" : "") + ":"}}</div>
			<div v-for="item of winners" :key="item" class="distItem">
				<div class="distText">Votes: {{ images[item] }}</div>
				<img
					class="winnerImage"
					:src="config.public.apiBase + '/images/' + item"
					alt="The winning image"
				>
			</div>
		</div>
		<div class="distContainer">
			<div class="heading">Vote Distribution:</div>
			<div v-for="item in Object.keys(images)" :key="item" class="distItem">
				<div class="distText">Votes: {{ images[item] }}</div>
				<img
					class="distImage"
					:src="config.public.apiBase + '/images/' + item"
					alt="Vote distribution image"
				>
			</div>
		</div>
	</div>
	<div v-else class="endMessage">
		This poll will end in {{ ends }}.
	</div>
</template>

<script lang="ts">
export default defineComponent({
	data() {
		return {
			config: useRuntimeConfig(),
			id: this.$route.params.id,
			max: 0,
			winners: new Array<string>(),
			votes: new Array<number>(),
			images: {} as Record<string, string>,
			ended: true,
			ends: ""
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
				if (data.ends) {
					countdown(data.ends, (str: string) => { this.ends = str; if (str === "0s") { this.showResults(); } });
					this.ended = false;
					return;
				}
				for (let item in data.votes) {
					this.images[this.getExtension(item, data.images)] = data.votes[item];
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

<style scoped>
.winnerContainer {
	display: flex;
	padding: 40px 100px;
	flex-direction: column;
	justify-content: center;
	margin: auto;
	text-align: center;
}

.heading {
	font-size: 40px;
}

img {
	margin: 30px 0 auto;
	width: 50%;
    border: 4px solid #ffffff;
}

.distContainer {
	display: flex;
	padding: 40px 100px;
	flex-direction: column;
	justify-content: center;
	margin: auto;
	text-align: center;
}

.distItem {
	display: flex;
	flex-direction: row-reverse;
	justify-content: center;
	align-items: center;
}

.distText {
	font-size: 25px;
	margin: 0 40px;
}

.distImage {
	width: 30%;
}

.endMessage {
	height: 90vh;
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: 30px;
}
</style>
