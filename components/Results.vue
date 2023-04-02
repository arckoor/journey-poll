<script setup lang="ts">
defineProps<{
	base: string
}>();
</script>

<template>
	<div v-if="ready" class="container">
		<h1 class="nameHeading">{{ name }}</h1>
		<div v-if="public">
			<div class="voteAmount">Voters: {{ voteAmount }}</div>
			<div class="winnerContainer">
				<div class="flex-center">
					<SvgMedal
						class="medal"
						:width="45"
						:height="45"
						:number="1"
					/>
					<h2 class="heading">{{ "Winner" + (first.length > 1 ? "s" : "") + ":"}}</h2>
				</div>
				<div v-for="item of first" :key="item" class="distItem">
					<CDNImg
						class="img"
						border-color="gold"
						:src="item"
						:aspect-ratio="aspectRatios[trimExt(item)]"
						sizes="50vw"
						alt="The winning image"
					/>
				</div>
			</div>
			<template v-for="(list, idx) in [second, third, remaining]" :key="idx">
				<div :class="'distContainer' + [' second', ' third', ''][idx]" v-if="list.length > 0">
					<div class="flex-center">
						<template v-if="list.length > 0">
							<SvgMedal
								v-if="idx == 0"
								class="medal"
								:width="45"
								:height="45"
								:number="2"
							/>
							<SvgMedal
								v-if="idx == 1"
								class="medal"
								:width="45"
								:height="45"
								:number="3"
							/>
						</template>
						<div>
							<h2 class="heading">{{ ["Second place", "Third place", "Remaining entries"][idx] }}:</h2>
							<div v-if="idx==2">(in random order)</div>
						</div>
					</div>
					<div v-for="item of list" :key="item" class="distItem">
						<CDNImg
							class="distImage img"
							:border-color="['silver', 'bronze', ''][idx]"
							:src="item"
							:aspect-ratio="aspectRatios[trimExt(item)]"
							sizes="30vw"
							alt="Vote distribution image"
						/>
					</div>
				</div>
			</template>
		</div>
		<div v-else-if="!public" class="endMessage">
			<span>This poll has ended.</span>
			<span>The results of this poll are not public.</span>
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
			voteAmount: 0,
			images: {} as Record<string, number>,
			aspectRatios: {} as { [key: string]: string },
			public: false,
			ready: false,
			first: Array<string>(),
			second: Array<string>(),
			third: Array<string>(),
			remaining: Array<string>()
		};
	},
	async mounted() {
		await this.showResults();
		this.ready = true;
	},
	methods: {
		async showResults() {
			const res = await fetch(this.base + "/results/" + this.id, {
				method: "GET",
				credentials: "include",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				}
			});
			// todo if (!res.ok) { ... }
			const data = await res.json();
			this.name = data.name;
			this.public = data.public;
			if (!this.public) return;
			this.voteAmount = data.voteAmount;
			this.first = data.first;
			this.second = data.second;
			this.third = data.third;
			this.remaining = shuffle(data.remaining);
			this.images = data.images;
			this.aspectRatios = data.aspectRatios;
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
@media only screen and (min-width: 700px) {
	.distItem {
		flex-direction: row-reverse;
	}

}

@media only screen and (max-width: 699px) {
	.distItem {
		flex-direction: column;
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

.flex-center {
	display: flex;
	justify-content: center;
	align-items: center;
}

.voteAmount {
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 30px 0 10px 0;
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

.winnerContainer {
	display: flex;
	flex-direction: column;
	justify-content: center;
	margin: auto;
	text-align: center;
	padding: 30px 100px;
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

.medal {
	margin-right: 10px
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

.distContainer {
	display: flex;
	flex-direction: column;
	justify-content: center;
	margin: auto;
	text-align: center;
	padding: 40px 100px 10px 100px;
}

.distContainer:last-of-type {
	padding-bottom: 100px;
}

.distItem {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-top: 25px;
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
