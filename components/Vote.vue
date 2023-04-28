<script setup lang="ts">
defineProps<{
	data: Record<string, string | Array<string> | { [key: string]: string }>
}>();
</script>

<template>
	<div class="container" v-if="ready">
		<h1 class="heading">{{ name }}</h1>
		<div class="remaining-time">
			<div>This polls ends in <Countdown :date="ends" color-type="red" />.</div>
		</div>
		<div v-if="voted" class="result-msg">
			Thank you for voting!
			You voted for:
			<div class="img-grid">
				<div class="img-grid-container" v-for="image in votedImages" :key="image">
					<CDNImg
						class="img"
						:src="image"
						sizes="310px"
						alt="Uploaded image"
					/>
				</div>
			</div>
			These were the submitted entries:
			<div class="img-grid img-grid--wide">
				<div class="img-grid-container" v-for="image in images" :key="image">
					<CDNImg
						class="img"
						:src="image"
						sizes="310px"
						alt="Uploaded image"
					/>
				</div>
			</div>
		</div>
		<div v-else>
			<div class="extra-info">
				<RichTextPreview :text="info" :allowed-votes="allowedVotes"/>
			</div>
			<div class="img-container"
				v-for="idx in images.length"
				:key="idx-1"
				:ref="'vote'+(idx-1)"
			>
				<div class="vote-container">
					<div class="letter no-select">{{ alphabet[idx-1] }}</div>
					<Checkbox
						@checked="checked[idx-1] = true"
						@unchecked="checked[idx-1] = false"
						:name="'vote'+(idx-1)"
						:id="'vote'+(idx-1)"
						:disabled="checked.reduce((a, x) => a + (x ? 1 : 0), 0) > allowedVotes-1 && !checked[idx-1]"
					/>
				</div>
				<CDNImg
					class="vote-image"
					:src="images[idx-1]"
					:alt="'Voting image ' + alphabet[idx-1]"
					:key="images[idx-1]"
					:aspect-ratio="aspectRatios[trimExt(images[idx-1])]"
					sizes="(max-width: 90vw) 900px"
				/>
				<hr class="image-divider" v-if="idx !== images.length">
			</div>
			<div class="submit-container">
				<h2 class="recap-heading" v-if="[...checked.keys()].filter(i => checked[i]).length > 0"><strong>Selected Images:</strong></h2>
				<div class="img-grid" >
					<div class="recap-img-container"
						v-for="idx in [...checked.keys()].filter(i => checked[i])"
						:key="idx"
						@click="(($refs['vote'+idx] as HTMLElement[])[0] as HTMLElement).scrollIntoView()"
					>
						<div class="recap-letter">{{ alphabet[idx] }}</div>
						<CDNImg
							class="recap-img"
							:src="images[idx]"
							:alt="'Recap image ' + alphabet[idx]"
							:click-disabled="true"
							:aspect-ratio="aspectRatios[trimExt(images[idx])]"
							sizes="280px"
						/>
					</div>
				</div>
				<Button
					text="Submit My Vote!"
					:disabled="checked.reduce((a, x) => a + (x ? 1 : 0), 0) < 1"
					@click="submit"
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
			name: "",
			info: "",
			allowedVotes: 0,
			images: new Array<string>(),
			aspectRatios: {} as { [key: string]: string },
			checked: new Array<boolean>(),
			alphabet: new Array<string>(),
			voted: false,
			votedImages: new Array<string>(),
			id: this.$route.params.id,
			ready: false,
			ends: ""
		};
	},
	async mounted() {
		await this.getPollData();
		this.ready = true;

	},
	methods: {
		async getPollData() {
			this.name = this.data.name as string;
			this.ends = this.data.ends as string;
			this.images = shuffle(this.data.images as Array<string>);
			this.aspectRatios = this.data.aspectRatios as { [key: string]: string };
			if (this.data.votes.length as number > 0) {
				this.voted = true;
				this.votedImages = this.data.votes as Array<string>;
				return;
			}
			for (let i=0; i<this.images.length; i++) {
				this.checked.push(false);
			}
			this.alphabet = this.makeAlphabet(this.images.length);
			this.info = this.data.info as string || "";
			this.allowedVotes = parseInt(this.data.allowedVotes as string);
		},
		async submit() {
			const votes = [];
			for (let item in this.checked) {
				if (this.checked[item]) {
					votes.push(this.images[item]);
				}
			}
			await fetch(this.config.public.pollApiBase + "/submit/" + this.id, {
				method: "POST",
				credentials: "include",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					votes: votes
				})
			});
			this.voted = true;
			this.votedImages = votes;
		},
		makeAlphabet(length: number) {
			const base = Array.from(Array(26)).map((_, i) => i + 65).map(x => String.fromCharCode(x));
			let alphabet = new Array<string>();
			for (let i=0; i<length%26; i++) {
				alphabet = [...alphabet, ...base.map(x => x.repeat(i+1))];
			}
			return alphabet;
		}
	}
});
</script>

<style scoped>
@media only screen and (max-device-width : 1024px) {
	.recapContainer {
		grid-template-columns: 1fr;
	}
}
@media only screen and (min-device-width : 1024px) {
	.recapContainer {
		grid-template-columns: 1fr 1fr 1fr;
	}
}

@media only screen and (max-width: 599px) {
	.image-divider {
		border: 2px solid var(--color-accent--border--dark);
	}
}

@media only screen and (min-width: 600px) {
	.image-divider {
		border: 3px solid var(--color-accent--border--dark);
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
	padding: 80px 0 0 0;
}

.heading {
	display: flex;
	justify-content: center;
	align-items: center;
	text-align: center;
	font-size: var(--font-size--heading);
}

.remaining-time {
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 20px 0 0 0;
}

.extra-info {
	padding: 30px 0 50px 0;
	max-width: 800px;
	font-size: var(--font-size--content)
}

.letter {
	font-size: var(--font-size--content-large);
	margin-right: 10px;
}

.img-container {
	flex-direction: column;
	justify-content: center;
	margin: auto;
}

.image-divider {
	margin: 50px 0;
	border-radius: 2px;
}

.vote-container {
	display: flex;
	justify-content: flex-start;
	align-items: center;
	flex-direction: row;
	margin-bottom: 20px;
}

.vote-image {
	margin: auto;
	width: 900px;
	max-width: 90vw;
}

.recap-heading {
	font-size: var(--font-size--content);
}

.recap-img-container {
	position: relative;
	margin: 10px 10px;
}

.recap-letter {
	font-size: var(--font-size--content);
	margin-bottom: 10px;
}

.recap-img {
	max-width: 80vw;
	width: 280px;
	margin: auto;
}

.submit-container {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 100%;
	margin: 60px 0 40px 0;
}

.submitButton {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 150px;
	padding: 10px 20px;
}

.result-msg {
	text-align: center;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	font-size: var(--font-size--content-large);
	padding-top: 70px;
}

.img-grid {
	margin: 40px 0;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
}

.img-grid--wide {
	width: 1000px;
	max-width: 80vw;
}

.img-grid-container {
	flex: 1 0 310px;
	width: fit-content;
	max-width: 310px;
	position: relative;
	margin: 10px 10px;
}
</style>
