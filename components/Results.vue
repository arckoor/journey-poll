<script setup lang="ts">
defineProps<{
	base: string
}>();
</script>

<template>
	<div class="nameHeading">{{ name }}</div>
	<div v-if="ended && !private">
		<div class="publishContainer" v-if="base.endsWith('/admin')">
			<Button
				v-if="!public"
				text="Publish results"
				@click="publishResults"
			/>
			<div v-else>Results published!</div>
		</div>
		<div class="winnerContainer">
			<div class="heading">{{ "Winner" + (winners.length > 1 ? "s" : "") + ":"}}</div>
			<div v-for="item of winners" :key="item" class="distItem">
				<div class="distText">Votes: {{ images[item] }}</div>
				<CDNImg
					class="img"
					:src="item"
					sizes="50vw"
					alt="The winning image"
				/>
			</div>
		</div>
		<div class="distContainer">
			<div class="heading">Vote Distribution:</div>
			<div class="voteAmount">Voters: {{ voteAmount }}</div>
			<div v-for="item in Object.keys(images)" :key="item" class="distItem">
				<div class="distText">Votes: {{ images[item] }}</div>
				<CDNImg
					class="distImage img"
					:src="item"
					sizes="30vw"
					alt="Vote distribution image"
				/>
			</div>
		</div>
	</div>
	<div v-else-if="private" class="endMessage">
		<span>This poll has ended.</span>
		<span>The results of this poll are not public.</span>
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
			public: false,
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
				this.public = data.public;
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
		},
		async publishResults() {
			await fetch(this.base + "/publishResults/" + this.id, {
				method: "POST",
				credentials: "include"
			}).then(async res => {
				if (res.status === 200) {
					this.public = true;
				}
			});
		}
	}
});

</script>

<style scoped>
.publishContainer {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 20px;
}

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

.img {
	margin: auto 0;
	width: 50vw;
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
	margin-top: 25px;
}

.distText {
	margin-left: 30px;
	font-size: 25px;
	width: 200px;
	white-space: nowrap;
}

.distImage {
	width: 30vw;
}

.endMessage {
	height: 90vh;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	font-size: 30px;
}
</style>
