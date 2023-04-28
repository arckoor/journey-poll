<script setup lang="ts">
defineProps<{
	text: string
	options: Record<string, string>
	currentOption: string
	optionChangeCb: (option: string) => void
}>();
</script>

<template>
	<div class="menu-container" :open="expanded" @click="handleOuterClick">
		<div class="menu button no-select">{{ text }} <SvgCaret :width="26" :height="26" /></div>
		<div :class="'dropdown' + (expanded ? ' visible' : '')" @click="superseded = true">
			<div
				v-for="key of Object.keys(options)"
				:key="key"
				@click="handleInnerClick(key)"
				:class="'dropdown-item no-select button' + (currentOption === key ? ' selected' : '')"
			>
				{{ options[key] }}
			</div>
		</div>
	</div>
</template>

<script lang="ts">
export default defineComponent({
	data() {
		return {
			expanded: false,
			superseded: false
		};
	},
	methods: {
		handleOuterClick() {
			if (!this.superseded) {
				this.expanded = !this.expanded;
			} else {
				this.superseded = false;
			}
		},
		handleInnerClick(key: string) {
			this.expanded = false;
			this.superseded = true;
			this.optionChangeCb(key);
		}
	}
});
</script>

<style scoped>
.button {
	text-align: center;
	cursor: pointer;
	border-radius: 5px;
	border: 2px solid var(--color-background--layer-10);
	transition: border-color var(--transition-short),
		color var(--transition-short),
		background-color var(--transition-short);
	padding: 9px 20px;
	display: flex;
	justify-content: center;
	align-items: center;
}

.menu > svg {
	margin-left: 10px;
	margin-right: -10px;
}

.menu:hover {
	border-color: var(--color-primary--hover)
}

.menu-container {
	position: relative;
}

.dropdown {
	display: none;
	position: absolute;
	width: fit-content;
	left: 50%;
	transform: translate(-50%, 0);
	margin-top: 10px;
	padding: 8px;
	background-color: var(--color-background--layer-0);
	border: 2px solid var(--color-background--layer-10);
	border-radius: 10px;
	z-index: 5;
}

.visible {
	display: block;
}

.dropdown-item {
	white-space: nowrap;
	margin: 7px 0;
}

.dropdown-item:hover {
	border-color: var(--color-primary--hover)
}

.selected {
	border-color: var(--color-text);
}

.menu-container[open=true]::before {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 4;
    display: block;
    content: " ";
    background: transparent;
}
</style>
