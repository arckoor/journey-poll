<script setup lang="ts">
definePageMeta({
	layout: "admin"
});
</script>

<template>
	<PollData
		:p-poll-name="name"
		:p-poll-info="info"
		:p-allowed-votes="allowedVotes"
		:p-ends="ends"
		:p-expires="expires"
		:p-previews="[]"
		:disabled="published"
		:valid-callback="validCallback"
		@interface="assignData"
	/>
	<div class="buttonContainer">
		<div v-if="!published && !working">
			<Button
				text="Create Poll!"
				:disabled="!valid"
				@click="create"
			/>
		</div>
		<div v-else-if="!published && working" class="working">
			<div class="spin"></div>
			<div class="spinMsg">Working on creating your poll...</div>
		</div>
		<div v-else-if="error">
			<div class="successMsg">An error occurred. Have you submitted the correct file formats?</div>
		</div>
		<div v-else>
			<div class="successMsg">Poll successfully published!</div>
			<Button text="Copy Link" @click="copyLink(config.public.base + '/' + id)" />
		</div>
	</div>
</template>

<script lang="ts">
import { IPollData } from "utils/interfaces";

export default defineComponent({
	data() {
		return {
			config: useRuntimeConfig(),
			name: "",
			info: "**Please check out the entries and vote for your favourites!** The entry letter (A, B, C) is assigned at the top of the image. Use the checkbox next to the entry letter to select your choices, then submit them at the bottom of the page!",
			allowedVotes: 3,
			ends: toDateInputValue(addDays(new Date(), 1)),
			expires: toDateInputValue(addDays(new Date(), 3)),
			valid: false,
			published: false,
			working: false,
			error: false,
			id: "",
			dataCallback: () => <IPollData>{}
		};
	},
	methods: {
		validCallback(valid: boolean) {
			this.valid = valid;
		},
		assignData(dataInterface: { dataInterface: () => IPollData; }) {
			this.dataCallback = dataInterface.dataInterface;
		},
		async create() {
			this.error = false;
			this.working = true;
			const data = this.dataCallback();
			const formData = new FormData();
			formData.append("name", data.name);
			formData.append("info", data.info);
			formData.append("allowedVotes", data.allowedVotes.toString());
			formData.append("ends", new Date(data.ends).getTime().toString());
			formData.append("expires", new Date(data.expires).getTime().toString());
			for (const item of data.images) {
				formData.append("images", item);
			}
			await fetch(this.config.public.pollApiBase + "/admin/create", {
				method: "POST",
				credentials: "include",
				body: formData
			})
				.then(async res => {
					if (res.status === 500) {
						this.working = false;
						this.error = true;
						return;
					}
					const data = await res.json();
					this.id = data;
				});
			this.working = false;
			this.published = true;
		}
	}
});
</script>

<style scoped>
.buttonContainer {
	padding: 20px 0 60px 0;
	display: flex;
	justify-content: center;
	align-items: center;
}

@keyframes spinner {
	0% {
		transform: rotate(0deg);
	}
	100% {
		transform: rotate(360deg);
	}
}

.spin::before {
	animation: .6s linear infinite spinner;
	animation-play-state: inherit;
	border: solid 4px var(--color-background--layer-40);
	border-bottom-color: var(--color-primary--hover);
	border-radius: 50%;
	content: "";
	height: 20px;
	position: absolute;
	min-width: 20px;
	width: 20px;
}

.working {
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
}

.spinMsg {
	margin-top: 27px;
	margin-left: 40px;
}

.successMsg {
	padding: 20px;
}
</style>
