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
		v-if = "ready"
	/>
	<div class="button-container">
		<div v-if="!published && !working">
			<Button
				text="Create Poll!"
				:disabled="!valid"
				@click="create"
			/>
		</div>
		<div v-else-if="!published && working" class="working">
			<div class="spin"></div>
			<div class="spin-msg">Working on creating your poll...</div>
		</div>
		<div v-else-if="error">
			<div class="success-msg">An error occurred. Have you submitted the correct file formats?</div>
		</div>
		<div v-else class="done">
			<div class="success-msg">Poll successfully published!</div>
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
			info: "",
			allowedVotes: 0,
			ends: "",
			expires: "",
			valid: false,
			published: false,
			working: false,
			error: false,
			id: "",
			dataCallback: () => <IPollData>{},
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
		this.allowedVotes = Number(settings.allowedVotes) || 1;
		this.ends = makeDateFromConfig(settings.endTime, settings.endPlusDays) || toDateInputValue(addDays(new Date(), 1));
		this.expires = makeDateFromConfig(settings.expireTime, settings.expirePlusDays) || toDateInputValue(addDays(new Date(), 3));
		this.ready = true;
	},
	methods: {
		validCallback(valid: boolean) {
			this.valid = valid;
		},
		assignData(dataInterface: { dataInterface: () => IPollData; }) {
			this.dataCallback = dataInterface.dataInterface;
		},
		async create() {
			if (!this.valid) return;
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
.button-container {
	padding: 20px 0 80px 0;
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

.spin-msg {
	margin-top: 27px;
	margin-left: 40px;
}

.done {
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
}

.success-msg {
	padding: 20px;
}
</style>
