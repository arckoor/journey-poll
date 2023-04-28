<script setup lang="ts">
definePageMeta({
	layout: "admin"
});
</script>

<template>
	<div v-if="ready" class="container">
		<h1 class="poll-heading">{{ name }}</h1>
		<div v-if="!inProgress">
			<div class="button-container">
				<Button
					v-if="!working"
					:text="!public ? 'Publish results' : 'Unpublish results'"
					@click="!public ? publishResults() : unPublishResults()"
				/>
				<div v-else>Working on changing the status...</div>
			</div>
			<div class="button-container" v-if="winners.length > 1">
				<Button
					text="Create Tiebreaker"
					@click="createTiebreaker"
				/>
			</div>
		</div>
		<div v-else class="progress-msg red">
			This poll is still in progress!
		</div>
		<div class="winner-container">
			<h2 class="heading">{{ "Winner" + (winners.length > 1 ? "s" : "") + ":"}}</h2>
			<div v-for="item of winners" :key="item" class="dist-item">
				<div class="dist-text">Votes: {{ images[item] }}</div>
				<CDNImg
					class="img"
					:src="item"
					:aspect-ratio="aspectRatios[trimExt(item)]"
					sizes="50vw"
					alt="The winning image"
				/>
			</div>
		</div>
		<div class="dist-container">
			<h2 class="heading">Vote Distribution:</h2>
			<div class="vote-amount">Voters: {{ voteAmount }}</div>
			<div v-for="item in sortedImages" :key="item[0]" class="dist-item">
				<div class="dist-text">Votes: {{ item[1] }}</div>
				<CDNImg
					class="ist-image img"
					:src="(item[0] as string)"
					:aspect-ratio="aspectRatios[trimExt((item[0] as string))]"
					sizes="30vw"
					alt="Vote distribution image"
				/>
			</div>
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
			public: false,
			working: false,
			inProgress: true,
			ends: "",
			ready: false
		};
	},
	async mounted() {
		await this.showResults();
		this.ready = true;
	},
	methods: {
		async showResults() {
			await fetch(this.config.public.pollApiBase + "/admin/results/" + this.id, {
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
				this.public = data.public;
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
			await fetch(this.config.public.pollApiBase + "/admin/publishResults/" + this.id, {
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
			await fetch(this.config.public.pollApiBase + "/admin/unpublishResults/" + this.id, {
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
			await fetch(this.config.public.pollApiBase + "/admin/createTiebreaker/" + this.id, {
				method: "POST",
				credentials: "include"
			}).then(async res => {
				if (res.ok) {
					const data = await res.json();
					await navigateTo("/admin/edit/" + data);
				}
			});
		}
	}
});

</script>

<style scoped>

@media only screen and (min-width: 700px) {
	.dist-item {
		flex-direction: row-reverse;
	}
	.dist-text {
		margin: 0px 0 0 30px;
	}

}

@media only screen and (max-width: 699px) {
	.dist-item {
		flex-direction: column;
	}
	.dist-text {
		margin: 0 0 10px 0;
	}

}

@media only screen and (min-width: 600px) {
	.img {
		width: 50vw;
	}
	.ist-image {
		width: 30vw;
	}
	.winner-container {
		padding: 40px 100px;
	}
	.dist-container {
		padding: 40px 100px 80px 100px;
	}
}

@media only screen and (max-width: 599px) {
	.img {
		width: 80vw;
	}
	.ist-image {
		width: 60vw;
	}
	.winner-container {
		padding: 40px 0;
	}
	.dist-container {
		padding: 40px 0 80px 0;
	}
}

.container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	max-width: 90vw;
	margin: 0px auto;
}

.button-container {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 20px;
}

.progress-msg {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 20px;
	font-size: var(--font-size--heading);
}

.winner-container {
	display: flex;
	flex-direction: column;
	justify-content: center;
	margin: auto;
	text-align: center;
}

.poll-heading {
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

.dist-container {
	display: flex;
	flex-direction: column;
	justify-content: center;
	margin: auto;
	text-align: center;
}

.vote-amount {
	margin: 10px 0;
	font-size: var(--font-size--content);
}

.dist-item {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 25px;
}

.dist-text {
	font-size: var(--font-size--content);
	width: 200px;
	white-space: nowrap;
}
</style>
