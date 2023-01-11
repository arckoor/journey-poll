<script setup lang="ts">
definePageMeta({
	layout: "admin"
});
</script>

<template>
	<div v-if="ready">
		<PollData
			:p-poll-name="name"
			:p-poll-info="info"
			:p-allowed-votes="allowedVotes"
			:p-ends="ends"
			:p-expires="expires"
			:p-previews="previews"
			:disabled="false"
			:valid-callback="validCallback"
			@interface="assignData"
		/>
	</div>
	<div class="buttonContainer">
		<div v-if="!working">
			<Button
				text="Save changes!"
				:disabled="!valid"
				@click="save"
			/>
		</div>
		<div v-else-if="working" class="working">
			<div class="spin"></div>
			<div class="spinMsg">Working on saving your poll...</div>
		</div>
	</div>
</template>

<script lang="ts">
import { IPollData } from "utils/interfaces";

export default defineComponent({
	data() {
		return {
			config: useRuntimeConfig(),
			id: this.$route.params.id,
			name: "",
			info: "",
			allowedVotes: 0,
			ends: "",
			expires: "",
			previews: new Array<string>(),
			valid: false,
			ready: false,
			working: false,
			dataCallback: () => <IPollData>{}
		};
	},
	async mounted() {
		await this.getPollData();
		this.ready = true;
	},
	methods: {
		validCallback(valid: boolean) {
			this.valid = valid;
		},
		assignData(dataInterface: { dataInterface: () => IPollData; }) {
			this.dataCallback = dataInterface.dataInterface;
		},
		async getPollData() {
			await fetch(this.config.public.apiBase + "/admin/poll/" + this.id, {
				method: "GET",
				credentials: "include",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
				},
			})
				.then(async res => {
					const data = await res.json();
					this.name = data.name;
					this.info = data.info;
					this.allowedVotes = data.allowedVotes;
					this.ends = data.ends;
					this.expires = data.expires;
					this.previews = data.images;
					for (let i=0; i<this.previews.length; i++) {
						this.previews[i] = this.config.public.apiBase + "/images/" + this.previews[i];
					}
				});
		},
		async save() {
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
			for (const item of data.removedImages) {
				formData.append("removedImages", item);
			}
			await fetch(this.config.public.apiBase + "/admin/edit/" + this.id, {
				method: "POST",
				credentials: "include",
				body: formData
			});
			this.working = false;
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
