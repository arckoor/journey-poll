<script setup lang="ts">
defineProps<{
	date: string,
	colorType?: string
}>();
</script>

<template>
	<span :class="color">{{ dateText }}</span>
</template>

<script lang="ts">
export default defineComponent({
	emits: ["timerExpired", "timerReset"],
	data() {
		return {
			countdownDate: new Date(this.date).getTime(),
			intervalRef: 0,
			dateText: "",
			color: "",
			stopped: false,
			distance: 0
		};
	},
	mounted() {
		this.setTimerText();
		this.intervalRef = setInterval(this.setTimerText, 1000) as unknown as number;
		this.$watch("date", () => this.resetTimer());
	},
	methods: {
		setTimerText() {
			this.stopped = false;
			const now = Date.now();
			const distance = this.countdownDate - now;
			this.distance = distance;
			if (distance < 0) {
				clearInterval(this.intervalRef);
				this.dateText = "0s";
				this.stopped = true;
				this.setColor(distance);
				this.$emit("timerExpired");
				return;
			}
			this.setColor(distance);
			const days = Math.floor(distance / (1000 * 60 * 60 * 24));
			const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
			const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
			const seconds = Math.floor((distance % (1000 * 60)) / 1000);
			let endStr = "";
			if (days) endStr += `${days}d `;
			if (hours) endStr += `${hours}h `;
			if (minutes) endStr += `${minutes}m `;
			if (!days) endStr += `${seconds}s`;
			this.dateText = endStr.trim();
		},
		resetTimer() {
			this.$emit("timerReset");
			clearInterval(this.intervalRef);
			this.countdownDate = new Date(this.date).getTime();
			this.setTimerText();
			this.intervalRef = setInterval(this.setTimerText, 1000) as unknown as number;
		},
		setColor(distance: number) {
			switch (this.colorType) {
				case "green":
					if (!this.stopped) {
						this.color = "green";
						return;
					}
					break;
				case "red":
					if (distance <= 3600000) {
						this.color = "red";
						return;
					}
					break;
			}
			this.color = "color-normal";
		}
	}
});
</script>

<style scoped>
.color-normal {
	color: var(--color-text--disabled)
}
</style>
