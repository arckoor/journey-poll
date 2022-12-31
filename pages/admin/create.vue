<script setup lang="ts">
definePageMeta({
	layout: "admin"
});
</script>

<template>
	<div class="inputContainer">
		<div class="inputItem">
			<label for="pollName">Poll name:</label>
			<input
				type="text"
				name="pollName"
				id="pollName"
				v-model="name"
				:disabled="published"
			>
		</div>
		<div class="inputItem">
			<label for="pollEnd">Poll end:</label>
			<input
				type="date"
				name="pollEnd"
				id="pollEnd"
				:min="toDateInputValue(addDays(new Date(), 1))"
				v-model="ends"
				:disabled="published"
			>
		</div>
		<div class="inputItem">
			<label for="pollExpiry">Poll expiry:</label>
			<input
				type="date"
				name="pollExpiry"
				id="pollExpiry"
				:min="ends"
				v-model="expires"
				:disabled="published"
			>
		</div>
	</div>
	<div class="fileWrapper">
		<div class="button" @click="($refs.fileIn as HTMLInputElement).click()">Choose files</div>
		<input
			type="file"
			name="fileIn"
			id="fileIn"
			ref="fileIn"
			multiple
			required
			accept=".jpg,.png"
			@change="preview"
			:disabled="published"
		>
		<div class="imgGrid">
			<img
				v-for="image of previews"
				:key="image"
				:src="image"
				alt="Uploaded image"
			>
		</div>
	</div>
	<div class="buttonContainer">
		<div v-if="!published">
			<div @click="create" :class="'button' + (!(name !== '' && expires > ends && images.length > 0) ? ' noHover' : '')" >Create Poll!</div>
		</div>
		<div v-else>
			<div class="successMsg">Poll successfully published!</div>
			<div class="button" @click="copyLink(config.public.base + '/' + id)">Copy Link</div>
		</div>
	</div>
</template>

<script lang="ts">
export default defineComponent({
	data() {
		return {
			config: useRuntimeConfig(),
			name: "",
			ends: "",
			expires: "",
			images: new Array<File>(),
			previews: new Array<string>(),
			dZ: HTMLInputElement,
			published: false,
			id: ""
		};
	},
	mounted() {
		this.ends = toDateInputValue(addDays(new Date(), 1));
		this.expires = toDateInputValue(addDays(new Date(), 2));
	},
	methods: {
		preview(event: Event) {
			const files = (event.target as HTMLInputElement).files;
			this.images = [];
			this.previews = [];
			if (files) {
				for (let i=0; i < files.length; i++) {
					const reader = new FileReader();
					reader.onload = (event) => this.previews.push(event.target?.result as string);
					reader.readAsDataURL(files[i]);
					this.images.push(files[i]);
				}
			}
		},
		async create() {
			const formData = new FormData();
			formData.append("name", this.name);
			formData.append("ends", new Date(this.ends).getTime().toString());
			formData.append("expires", new Date(this.expires).getTime().toString());
			for (let item of this.images) {
				formData.append("images", item);
			}
			await fetch(this.config.public.apiBase + "/admin/create", {
				method: "POST",
				credentials: "include",
				body: formData
			})
				.then(async res => {
					const data = await res.json();
					console.log(data);
					this.id = data;
				});
			this.published = true;
		}
	}
});
</script>

<style scoped>
.inputContainer {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}

.inputItem {
	width: 700px;
	display: flex;
	align-items: center;
	justify-content: space-around;
	margin: 20px 0 0 0;
}

input[type=text],
input[type=date] {
	width: 500px;
}

label {
	width: 100px;
}

input[type=file] {
	display: none;
}

.fileWrapper {
	margin: 40px auto;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	width: 1000px;
}

.button {
	padding: 10px 20px;
	text-align: center;
}

.imgGrid {
	display: grid;
	grid-template-columns: auto auto auto;
	column-gap: 20px;
}

img {
	margin: 30px 0 auto;
	width: 100%;
    border: 4px solid #ffffff;
}

.buttonContainer {
	padding: 20px 0 60px 0;
	display: flex;
	justify-content: center;
	align-items: center;
}

.successMsg {
	padding: 20px;
}
</style>
