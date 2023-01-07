<script setup lang="ts">
defineProps<{
	base: string
}>();
</script>

<template>
	<!-- todo what if the poll doesn't even exist???? -->
	<div class="nameHeading">{{ name }}</div>
	<div v-if="ended && !private">
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
			<div class="voteAmount">Voters: {{ voteAmount }}</div>
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
	<div v-else-if="private" class="endMessage">
		The results of this poll are not public. <br />
		The poll results are not public.
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
			name: "",
			max: 0,
			voteAmount: 0,
			winners: new Array<string>(),
			votes: new Array<number>(),
			images: {} as Record<string, string>,
			ended: true,
			private: false,
			ends: ""
		};
	},
	mounted() {
		this.showResults();
	},
	methods: {
		async showResults() {
			await fetch(this.base + "/results/" + this.id, {
				method: "GET",
				credentials: "include",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				}
			}).then(async res => {
				const data = await res.json();
				this.name = data.name;
				if (data.private) {
					this.private = true;
					return;
				}
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
				this.voteAmount = data.voteAmount;
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

.nameHeading {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 30px 0 0 0;
	font-size: 50px;
}

.heading {
	font-size: 40px;
}

img {
	margin: 30px 0 auto;
	width: 50%;
    border: var(--image-width--border) solid var(--color-accent--border);
}

.distContainer {
	display: flex;
	padding: 40px 100px;
	flex-direction: column;
	justify-content: center;
	margin: auto;
	text-align: center;
}

.voteAmount {
	margin: 10px 0;
	font-size: 22px;
}

.distItem {
	display: flex;
	flex-direction: row-reverse;
	justify-content: center;
	align-items: center;
}

.distText {
	font-size: 25px;
	width: 200px;
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
