<script setup lang="ts">
definePageMeta({
	layout: "admin"
});
</script>

<template>
	<Title>Create a new poll</Title>
	<input
		type="text"
		name=""
		id=""
		v-model="name"
		:disabled="published"
	>
	<input
		type="date"
		name=""
		:min="toDateInputValue(addDays(new Date(), 1))"
		id=""
		v-model="ends"
		:disabled="published"
	>
	<input
		type="date"
		name=""
		:min="ends"
		id=""
		v-model="expires"
		:disabled="published"
	>
	<input
		type="file"
		name=""
		id=""
		multiple
		required
		accept=".jpg,.png"
		@change="preview"
		:disabled="published"
	>
	<div v-if="!published">
		<button @click="create" :disabled="!(name !== '' && expires > ends && images.length > 0)" >Create Poll!</button>
	</div>
	<div v-else>
		Poll successfully published
		<button @click="copyLink(config.public.base + '/' + id)">Copy Link</button>
	</div>
	<div v-for="image of previews" :key="image">
		<img :src="image" alt="">
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
