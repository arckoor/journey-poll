<script setup lang="ts">
definePageMeta({
	layout: "admin"
});
</script>

<template>
	<div class="input-container" v-if="ready">
		<div class="input-item">
			<label for="pollName">Poll name:</label>
			<input
				type="text"
				id="pollName"
				v-model="name"
			>
		</div>
		<div class="input-item">
			<label for="pollInfo">Poll info:</label>
			<textarea
				style="resize:vertical;"
				rows="6"
				id="pollInfo"
				v-model="info"
				@input="cleanNewlines"
			/>
		</div>
		<div class="input-item">
			<label for="infoPreview">Info preview:</label>
			<RichTextPreview
				class="input-text--preview"
				:text="info"
				:allowed-votes="Number(allowedVotes)"
			/>
		</div>
		<div class="input-item">
			<label for="allowedVotes">Votes:</label>
			<input
				type="number"
				id="votes"
				v-model="allowedVotes"
				min="1"
			>
		</div>
		<div class="input-item">
			<label for="pollEnd">Poll end:</label>
			<input
				type="time"
				id="pollEnd"
				v-model="ends"
			>
		</div>
		<div class="input-item">
			<label for="allowedVotes">Add days to end time:</label>
			<input
				type="number"
				id="votes"
				v-model="endPlusDays"
				min="1"
			>
		</div>
		<div class="input-item">
			<label for="pollExpiry">Poll expiry:</label>
			<input
				type="time"
				id="pollExpiry"
				v-model="expires"
			>
		</div>
		<div class="input-item">
			<label for="allowedVotes">Add days to expire time:</label>
			<input
				type="number"
				id="votes"
				v-model="expirePlusDays"
				min="1"
			>
		</div>
		<Button class="save-button" text="Save" @click="saveSettings" />
	</div>
</template>

<script lang="ts">
export default defineComponent({
	data() {
		return {
			config: useRuntimeConfig(),
			name: "",
			info: "",
			allowedVotes: 1,
			ends: "",
			endPlusDays: 0,
			expires: "",
			expirePlusDays: 0,
			ready: false
		};
	},
	async mounted() {
		const data = await fetch(this.config.public.pollApiBase + "/admin/settings", {
			credentials: "include"
		});
		const settings = await data.json();
		this.name = settings.name || "";
		this.info = settings.info || "";
		this.allowedVotes = settings.allowedVotes;
		this.ends = settings.endTime || "";
		this.endPlusDays = settings.endPlusDays || "";
		this.expires = settings.expireTime || "";
		this.expirePlusDays = settings.expirePlusDays || "";
		this.ready = true;
	},
	methods: {
		async saveSettings() {
			const data = {
				name: this.name,
				info: this.info,
				allowedVotes: this.allowedVotes,
				endTime: this.ends,
				endPlusDays: this.endPlusDays,
				expireTime: this.expires,
				expirePlusDays: this.expirePlusDays
			};
			await fetch(this.config.public.pollApiBase + "/admin/settings", {
				method: "POST",
				credentials: "include",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
				body: JSON.stringify(data)
			});
		}
	}
});
</script>

<style scoped>
@media only screen and (min-width: 1200px) {
	.input-item > label {
		margin: 0 20px 0 0;
	}
}

@media only screen and (max-width: 1199px) {
	.input-item {
		flex-direction: column;
	}
	.input-item > label {
		align-self: flex-start;
		margin: 0 0 5px 0;
	}
}

@media only screen and (min-width: 600px) and (max-width: 899px) {
	.input-text--preview,
	textarea,
	input[type=text],
	input[type=time],
	input[type=datetime-local],
	input[type=number] {
		max-width: 70vw;
	}
}

@media only screen and (max-width: 599px) {
	.input-text--preview,
	textarea,
	input[type=text],
	input[type=time],
	input[type=datetime-local],
	input[type=number] {
		max-width: 85vw;
	}
}
.input-container {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	margin: 20px;
}

.input-item {
	display: flex;
	align-items: center;
	justify-content: space-around;
	margin: 20px 0 0 0;
}

.input-text--preview {
	padding: 9px 10px;
	border: 2px solid var(--color-background--layer-10);
	border-radius: 5px;
}


.input-text--preview,
textarea,
input[type=text],
input[type=time],
input[type=datetime-local],
input[type=number] {
	width: 500px;
}

label {
	width: 120px;
}

textarea {
	resize: none;
}

.save-button {
	margin: 30px 0 50px 0;
}
</style>
