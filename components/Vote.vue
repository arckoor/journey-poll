<script setup lang="ts">
defineProps<{
	status: number,
	data: Record<string, string | Array<string>>
}>();
</script>

<template>
	<div class="container" v-if="ready">
		<div v-if="exists">
			<div class="heading">{{ name }}</div>
			<div class="remainingTime">
				<div :class="new RegExp(/^[0-9]*m|^[0-9]*s/).test(ct) ? ' red' : ''">This polls ends in {{ ct }}.</div>
			</div>
			<div v-if="voted" class="resultMessage">
				Thank you for voting!
			</div>
			<div v-else>
				<div class="additionalInfo">
					<RichTextPreview :text="info" :entries="allowedVotes"/>
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
							:disabled="checked.reduce((a, x) => a + (x ? 1 : 0), 0) > allowedVotes-1 && !checked[idx-1]"
						>
						<div class="cbLetter">{{ alphabet[idx-1] }}</div>
					</div>
				</div>
				<div class="submitContainer">
					<div @click="submit" :class="'submitButton button' + (checked.reduce((a, x) => a + (x ? 1 : 0), 0) < 1 ? ' noHover': '')">
						Submit My Vote!
					</div>
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
			info: "",
			allowedVotes: 0,
			images: new Array<string>(),
			checked: new Array<boolean>(),
			alphabet: new Array<string>(),
			voted: false,
			id: this.$route.params.id,
			exists: true,
			ready: false,
			ct: ""
		};
	},
	async mounted() {
		await this.getPollData();
		this.ready = true;

	},
	methods: {
		async getPollData() {
			if (this.status !== 200) {
				this.exists = false;
				return;
			}
			this.name = this.data.name as string;
			countdown(this.data.ends as string, (str: string) => { this.ct = str; });
			if (this.data.voted) {
				this.voted = true;
				return;
			}
			this.images = this.shuffle(this.data.images as Array<string>);
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
.container {
	display: flex;
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
	display: flex;
	font-size: 34px;
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

.submitContainer {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%;
	margin: 40px 0 40px 0;
}

.submitButton {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 120px;
	padding: 10px 20px;
}

.resultMessage {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	font-size: 24px;
	padding-top: 100px;
}
</style>