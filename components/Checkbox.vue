<script setup lang="ts">
interface Props {
	disabled?: boolean
	initialValue?: boolean
}

withDefaults(defineProps<Props>(), {
	disabled: false,
	initialValue: false
});
</script>

<template>
	<div :class="'checkbox' + (disabled ? ' disabled' : '')" @click="toggle">
		<div :class="'checkbox-inner' + (checked ? ' checkbox-inner--checked' : ' checkbox-inner--unchecked')"></div>
		<input type="checkbox" :value="checked">
	</div>
</template>

<script lang="ts">
export default defineComponent({
	emits: ["checked", "unchecked"],
	data() {
		return {
			checked: this.initialValue
		};
	},
	mounted() {
		this.$watch("checked", () => {
			if (this.checked) this.$emit("checked");
			else this.$emit("unchecked");
		});
	},
	methods: {
		toggle() {
			if (!this.disabled) {
				this.checked = !this.checked;
			}
		}
	}
});
</script>

<style scoped>
input[type=checkbox],
input[type=checkbox]:checked {
	display: none;
}

.checkbox {
	cursor: pointer;
	width: 25px;
	height: 25px;
	border: var(--color-text) solid var(--checkbox--border);
	border-radius: 6px;
	transition: all var(--transition-short);
}

.disabled{
	cursor: default;
	border-color: var(--color-text--disabled);
}

.checkbox-inner {
	margin: 5px 5px 5px 5px;
	width: 15px;
	height: 15px;
	border-radius: 3px;
	transition: all var(--transition-short);
}

.checkbox-inner--unchecked {
	background-color: transparent;
}

.checkbox-inner--checked {
	background-color: var(--color-primary--hover);
}
</style>
