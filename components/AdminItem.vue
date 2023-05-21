<!-- eslint-disable @typescript-eslint/no-empty-function -->
<script setup lang="ts">
interface Props {
	username?: string,
	id?: string,
	isRoot?: boolean,
	loggedIn?: boolean,
	createMode?: boolean,
	editCallback?: (id: string, username: string, password: string) => void,
	deleteCallback?: (id: string, username: string) => void,
	createCallback?: (username: string, password: string) => void,
}

withDefaults(defineProps<Props>(), {
	username: "",
	id: "",
	isRoot: false,
	loggedIn: false,
	createMode: false,
	editCallback: () => {},
	deleteCallback: () => {},
	createCallback: () => {},
});
</script>

<template>
	<div class="item item--formatting" v-if="!mode">
		<div v-if="!editEnabled" class="item-info--wrapper">
			<div class="item-info">
				<div class="field field--left">
					<div class="field--large">Username:</div>
					<div>Root permission:</div>
					<div>Logged in:</div>
				</div>
				<div class="field">
					<div class="field--large">{{ username }}</div>
					<div>{{ isRoot }}</div>
					<div>{{ loggedIn }}</div>
				</div>
			</div>
			<div class="controls">
				<Button class="control-item" @click="edit">
					<template #buttonSlot><SvgEdit :width="30" :height="30" /></template>
				</Button>
				<Button class="control-item delete" @click="deleteCallback(id, username)">
					<template #buttonSlot><SvgDelete :width="30" :height="30" /></template>
				</Button>
			</div>
		</div>
		<div v-else>
			<div class="item-info">
				<div class="field field--left">
					<div>Username:</div>
					<div>Password:</div>
				</div>
				<div class="field">
					<input
						type="text"
						id="username"
						v-model="editName"
						class="field-input"
					>
					<input
						type="text"
						id="password"
						v-model="editPassword"
						class="field-input"
					>
				</div>
			</div>
			<div class="controls">
				<Button class="control-item" @click="editCancel">
					<template #buttonSlot><SvgClose :width="30" :height="30" /></template>
				</Button>
				<Button class="control-item delete" @click="editSave">
					<template #buttonSlot><SvgSave :width="30" :height="30" /></template>
				</Button>
			</div>
		</div>
	</div>
	<div v-else class="item">
		<div class="create-wrapper">
			<Button class="control-item" @click="create">
				<template #buttonSlot><SvgCreate :width="30" :height="30" /></template>
			</Button>
		</div>
	</div>
</template>

<script lang="ts">
export default defineComponent({
	data() {
		return {
			editEnabled: false,
			editName: this.username,
			editPassword: "",
			mode: this.createMode
		};
	},
	methods: {
		edit() {
			this.editName = this.username;
			this.editPassword = "";
			this.editEnabled = true;
		},
		editCancel() {
			this.editPassword = "";
			this.editEnabled = false;
			if (this.createMode) this.mode = true;
		},
		async editSave() {
			if (!this.createMode)this.editCallback(this.id, this.editName, this.editPassword);
			else this.createCallback(this.editName, this.editPassword);
			this.editPassword = "";
			this.editEnabled = false;
			if (this.createMode) this.mode = true;
		},
		create() {
			this.mode = false;
			this.edit();
		}
	}
});
</script>

<style scoped>
/* todo mobile wrap align left */
.item {
	display: flex;
	padding: 10px 20px;
	margin: 20px 10px 10px 10px;
	min-width: 300px;
	border: 2px solid var(--color-background--layer-10);
}

.item--formatting {
	flex-direction: column;
	align-items: flex-start;
	justify-content: flex-start;
}

.item-info--wrapper {
	width: 100%
}

.item-info {
	display: flex;
	flex-direction: row;
}

.field {
	display: flex;
	justify-content: center;
	flex-direction: column;

}

.field--left {
	margin-right: 10px;
}

.field--large {
	font-size: var(--font-size--content)
}

.field-input {
	width: 165px;
}

.controls {
	display: flex;
	flex-direction: row;
	justify-content: center;
	align-items: center;
	width: 100%;
	margin-top: 15px
}

.control-item {
	margin: 0 5px;
}
.delete:hover {
	background-color: var(--color-primary--hover);
}

.create-wrapper {
	display: flex;
	justify-content: center;
	align-items: center;
	width: 100%
}
</style>
