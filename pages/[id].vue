<template>
	<div class="container" v-if="ready">
		<div v-if="exists">
			<div class="heading">{{ name }}</div>
			<div v-if="voted && !ended" class="resultMessage">
				Thank you for voting!
			</div>
			<div v-else-if="ended" class="resultMessage">
				This poll has already ended.
			</div>
			<div v-else>
				<div :class="new RegExp(/^[0-9]*m|^[0-9]*s/).test(ct) ? ' red' : ''">This polls ends in {{ ct }}.</div>
				<div class="additionalInfo">
					<strong>Please check out the entries and then on the bottom of this page vote for your favorites!</strong>
					The entry letter (A,B,C) is assigned at the top of the image. <u>You may vote for up to 3 entries!</u> <!-- todo the number 3 should be modifiable -->
					Thanks for your vote!
				</div>
				<div class="imageContainer" v-for="idx in images.length" :key="idx">
					<div class="letter">{{ alphabet[idx-1] }}</div>
					<img
						class="voteImage"
						:src="config.public.apiBase + '/images/' + images[idx-1]"
						:alt="'Voting image ' + alphabet[idx-1]"
						:key="images[idx]"
					>
				</div>
				<div class="checkboxContainer">
					<div class="checkboxItem" v-for="idx in images.length" :key="'box'+idx">
						<input
							type="checkbox"
							:name="'vote'+idx"
							:id="'vote'+idx"
							v-model="checked[idx-1]"
							:disabled="checked.reduce((a, x) => a + (x ? 1 : 0), 0) > 2 && !checked[idx-1]"
						>
						<div class="cbLetter">{{ alphabet[idx-1] }}</div>
					</div>
					<button @click="submit" class="submitButton" :disabled="checked.reduce((a, x) => a + (x ? 1 : 0), 0) < 1">Submit</button>
				</div>
			</div>
		</div>
		<div v-else-if="!exists" class="resultMessage">
			This poll wasn't found...
		</div>
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
			alphabet: new Array<string>(),
			voted: false,
			id: this.$route.params.id,
			exists: true,
			ended: false,
			ready: false,
			ct: ""
		};
	},
	async mounted() {
		await this.checkVoted();
		await this.getPollData();
		this.ready = true;

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
					this.name = json.name;
					if (this.voted) {
						return;
					}
					if (json.ended) {
						this.ended = true;
						return;
					}
					countdown(json.ends, (str: string) => { this.ct = str; });
					this.images = json.images;
					for (let i=0; i<this.images.length; i++) {
						this.checked.push(false);
					}
					this.alphabet = this.makeAlphabet(this.images.length);
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
@font-face {
	font-family: Eyeglass Condensed Bold;
	src: url(css/fonts/Eyeglass/EyeglassCondensedBold.ttf);
}

.container {
	font-family: Eyeglass Condensed Bold;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 900px;
	max-width: 90vw;
	margin: 0px auto;
	padding: 80px 0 0 0;
}

.heading {
	width: 100%;
	display: flex;
	font-size: 34px;
	text-align: left;
}

.additionalInfo {
	padding: 30px 0 50px 0;
	max-width: 800px;
	font-size: 24px
}

.letter {
	font-size: 26px;
	padding-top: 20px;
}

.imageContainer {
	flex-direction: column;
	justify-content: center;
	width: 100%;
	margin: auto;
}

.voteImage {
	margin: auto;
	width: 100%;
    border: 4px solid #ffffff;
}

.checkboxContainer {
	padding-top: 20px;
	display: flex;
	flex-direction: column;
}

.checkboxItem {
	display: flex;
	padding: 12px 0 0px 0;
	align-items: center;
}

.cbLetter {
	padding-left: 10px;
}

input[type=checkbox] {
	width: 18px;
	height: 18px;
	cursor: pointer;
}
.buttonContainer {
	height: 5vh;
	display: flex;
	width: 100%;
	align-items: center;
	justify-content: center;
}
button {
	display: flex;
	align-self: center;
	align-items: center;
	justify-content: center;
	font-family: Eyeglass Condensed Bold;
	cursor: pointer;
	border: 0px;
	text-align: center;
	background: rgb(221, 92, 18);
	border-radius: 3px;
	transition: background .3s;
	color: #ffffff;
	width: 120px;
	font-size: 24px;;
	margin: 40px 0 40px 0;
}

button:disabled {
	background-color: transparent;
	cursor: default;
}

.resultMessage {
	font-size: 24px;
	padding-top: 100px;
}
</style>
