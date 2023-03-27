<script setup lang="ts">
defineProps<{
	data: Record<string, string | Array<string> | { [key: string]: string }>
}>();
</script>

<template>
	<div class="container" v-if="ready">
		<h1 class="heading">{{ name }}</h1>
		<div class="remainingTime">
			<div>This polls ends in <Countdown :date="ends" color-type="red" />.</div>
		</div>
		<div v-if="voted" class="resultMessage">
			Thank you for voting!
		</div>
		<div v-else>
			<div class="additionalInfo">
				<RichTextPreview :text="info" :allowed-votes="allowedVotes"/>
			</div>
			<div class="imageContainer"
				v-for="idx in images.length"
				:key="idx-1"
				:ref="'vote'+(idx-1)"
			>
				<div class="voteContainer">
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
					class="voteImage"
					:src="images[idx-1]"
					:alt="'Voting image ' + alphabet[idx-1]"
					:key="images[idx-1]"
					:aspect-ratio="aspectRatios[trimExt(images[idx-1])]"
					sizes="(max-width: 90vw) 900px"
				/>
				<hr class="imageDivider" v-if="idx !== images.length">
			</div>
			<div class="submitContainer">
				<h2 class="recapHeading" v-if="[...checked.keys()].filter(i => checked[i]).length > 0"><strong>Selected Images:</strong></h2>
				<div class="recapContainer" >
					<div class="recapImageContainer"
						v-for="idx in [...checked.keys()].filter(i => checked[i])"
						:key="idx"
						@click="(($refs['vote'+idx] as HTMLElement[])[0] as HTMLElement).scrollIntoView()"
					>
						<div class="recapLetter">{{ alphabet[idx] }}</div>
						<CDNImg
							class="recapImage"
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
			if (this.data.voted) {
				this.voted = true;
				return;
			}
			this.images = shuffle(this.data.images as Array<string>);
			this.aspectRatios = this.data.aspectRatios as { [key: string]: string };
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
		makeAlphabet(length: number) {
			const alpha = Array.from(Array(length)).map((e, i) => i + 65);
			const alphabet = alpha.map((x) => String.fromCharCode(x));
			return alphabet;
		}
	}
});
</script>

<style scoped>
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

.remainingTime {
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 20px 0 0 0;
}

.additionalInfo {
	padding: 30px 0 50px 0;
	max-width: 800px;
	font-size: var(--font-size--content)
}

.letter {
	font-size: var(--font-size--content-large);
	margin-right: 10px;
}

.imageContainer {
	flex-direction: column;
	justify-content: center;
	margin: auto;
}

.imageDivider {
	margin: 50px 0;
	border: 3px solid var(--color-accent--border);
	border-radius: 2px;
}

.voteContainer {
	display: flex;
	justify-content: flex-start;
	align-items: center;
	flex-direction: row;
	margin-bottom: 20px;
}

.voteImage {
	margin: auto;
	width: 900px;
	max-width: 90vw;
}

.recapHeading {
	font-size: var(--font-size--content);
}

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

.recapContainer {
	margin: 20px 0 30px 0;
	display: grid;
}

.recapImageContainer {
	position: relative;
	margin: 10px 10px;
}

.recapLetter {
	font-size: var(--font-size--content);
	margin-bottom: 10px;
}

.recapImage {
	max-width: 80vw;
	width: 280px;
	margin: auto;
}

.submitContainer {
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

.resultMessage {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	font-size: var(--font-size--content-large);
	padding-top: 100px;
}
</style>
