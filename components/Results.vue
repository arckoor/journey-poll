<script setup lang="ts">
defineProps<{
	base: string
}>();
</script>

<template>
	<div v-if="ready" class="container">
		<h1 class="nameHeading">{{ name }}</h1>
		<div v-if="ended && !private">
			<div v-if="base.endsWith('/admin')">
				<div v-if="!inProgress">
					<div class="buttonContainer">
						<Button
							v-if="!working"
							:text="!public ? 'Publish results' : 'Unpublish results'"
							@click="!public ? publishResults() : unPublishResults()"
						/>
						<div v-else>Working on changing the status...</div>
					</div>
					<div class="buttonContainer" v-if="winners.length > 1 && ended">
						<Button
							text="Create Tiebreaker"
							@click="createTiebreaker"
						/>
					</div>
				</div>
				<div v-else class="progressMessage red">
					This poll is still in progress!
				</div>
			</div>
			<div class="winnerContainer">
				<h2 class="heading">{{ "Winner" + (winners.length > 1 ? "s" : "") + ":"}}</h2>
				<div v-for="item of winners" :key="item" class="distItem">
					<div class="distText">Votes: {{ images[item] }}</div>
					<CDNImg
						class="img"
						:src="item"
						:aspect-ratio="aspectRatios[trimExt(item)]"
						sizes="50vw"
						alt="The winning image"
					/>
				</div>
			</div>
			<div :class="'displayVotesContainer no-select' + (!displayVotes ? ' displayVotesContainerMargin' : '')">
				<div class="displayVotesText">Display Vote Distribution</div>
				<Checkbox
					@checked="displayVotes = true"
					@unchecked="displayVotes = false"
					name="displayVotes"
					id="displayVotes"
					:initial-value="displayVotes"
				/>
			</div>
			<div class="distContainer" v-if="displayVotes">
				<h2 class="heading">Vote Distribution:</h2>
				<div class="voteAmount">Voters: {{ voteAmount }}</div>
				<div v-for="item in sortedImages" :key="item[0]" class="distItem">
					<div class="distText">Votes: {{ item[1] }}</div>
					<CDNImg
						class="distImage img"
						:src="(item[0] as string)"
						:aspect-ratio="aspectRatios[trimExt((item[0] as string))]"
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
			<span>This poll will end in <Countdown :date="ends" color-type="red" />.</span>
		</div>
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
			images: {} as Record<string, number>,
			aspectRatios: {} as { [key: string]: string },
			sortedImages: [] as Array<Array<string | number>>,
			ended: true,
			displayVotes: false,
			displayVotesCookie: useDisplayVotes(),
			private: false,
			public: false,
			working: false,
			inProgress: true,
			ends: "",
			ready: false
		};
	},
	async mounted() {
		this.displayVotes = this.displayVotesCookie as boolean;
		this.$watch("displayVotes", () => this.assignCookie());
		await this.showResults();
		this.ready = true;
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
				this.inProgress = data.inProgress ?? true;
				if (data.private) {
					this.private = true;
					return;
				}
				this.public = data.public;
				if (data.ends) {
					this.ends = data.ends;
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
				this.aspectRatios = data.aspectRatios;
				this.voteAmount = data.voteAmount;
				// https://stackoverflow.com/a/37607084/12203337
				this.sortedImages = Object.entries(this.images).sort((a, b) => a[1] - b[1]).reverse();
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
			this.working = true;
			await fetch(this.base + "/publishResults/" + this.id, {
				method: "POST",
				credentials: "include"
			}).then(async res => {
				if (res.ok) {
					this.public = true;
				}
			});
			this.working = false;
		},
		async unPublishResults() {
			this.working = true;
			await fetch(this.base + "/unpublishResults/" + this.id, {
				method: "POST",
				credentials: "include"
			}).then(async res => {
				if (res.ok) {
					this.public = false;
				}
			});
			this.working = false;
		},
		async createTiebreaker() {
			await fetch(this.base + "/createTiebreaker/" + this.id, {
				method: "POST",
				credentials: "include"
			}).then(async res => {
				if (res.ok) {
					const data = await res.json();
					await navigateTo("/admin/edit/" + data);
				}
			});
		},
		assignCookie() {
			this.displayVotesCookie = this.displayVotes;
		}
	}
});

</script>

<style scoped>

@media only screen and (min-width: 700px) {
	.distItem {
		flex-direction: row-reverse;
	}
	.distText {
		margin: 0px 0 0 30px;
	}

}

@media only screen and (max-width: 699px) {
	.distItem {
		flex-direction: column;
	}
	.distText {
		margin: 0 0 10px 0;
	}

}

@media only screen and (min-width: 600px) {
	.img {
		width: 50vw;
	}
	.distImage {
		width: 30vw;
	}
}

@media only screen and (max-width: 599px) {
	.img {
		width: 80vw;
	}

	.distImage {
		width: 60vw;
	}
}

.container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	width: 900px;
	max-width: 90vw;
	margin: 0px auto;
}

.buttonContainer {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 20px;
}

.progressMessage {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 20px;
	font-size: var(--font-size--heading);
}

.winnerContainer {
	display: flex;
	flex-direction: column;
	justify-content: center;
	margin: auto;
	text-align: center;
	padding: 40px 100px;
}

.nameHeading {
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 30px 0 0 0;
	text-align: center;
	font-size: var(--font-size--heading);
}

.heading {
	font-size: var(--font-size--heading-section);
}

.img {
	margin: auto 0;
}

.displayVotesContainer {
	display: flex;
	justify-content: center;
	align-items: center;
	font-size: var(--font-size--content);
}

.displayVotesContainerMargin {
	margin: 0 0 100px 0;
}

.displayVotesText {
	margin-right: 10px;
}

.distContainer {
	display: flex;
	flex-direction: column;
	justify-content: center;
	margin: auto;
	text-align: center;
	padding: 40px 100px 80px 100px;
}

.voteAmount {
	margin: 10px 0;
	font-size: var(--font-size--content);
}

.distItem {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 25px;
}

.distText {
	font-size: var(--font-size--content);
	width: 200px;
	white-space: nowrap;
}

.endMessage {
	height: 90vh;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	font-size: var(--font-size--heading-section);
}
</style>
