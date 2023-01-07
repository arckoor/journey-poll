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
				id="pollName"
				v-model="name"
				:disabled="published"
			>
		</div>
		<div class="inputItem">
			<label for="pollInfo">Poll info:</label>
			<textarea
				rows="5"
				id="pollInfo"
				v-model="info"
				:disabled="published"
				@input="removeNewlines"
			/>
		</div>
		<div class="inputItem">
			<label for="infoPreview">Info preview:</label>
			<RichTextPreview
				class="textPreview"
				:text="info"
				:allowed-votes="allowedVotes"
			/>
		</div>
		<div class="inputItem">
			<label for="allowedVotes">Votes:</label>
			<input
				type="number"
				id="votes"
				v-model="allowedVotes"
				min="1"
				:max="images.length"
				:disabled="published"
			>
		</div>
		<div class="inputItem">
			<label for="pollEnd">Poll end:</label>
			<input
				type="date"
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
				id="pollExpiry"
				:min="ends"
				v-model="expires"
				:disabled="published"
			>
		</div>
	</div>
	<div class="fileWrapper">
		<!-- todo a drop zone would be cool -->
		<Button text="Choose files" @click="($refs.fileIn as HTMLInputElement).click()" />
		<input
			type="file"
			id="fileIn"
			ref="fileIn"
			multiple
			required
			accept=".jpg,.png,.jpeg"
			@change="preview"
			:disabled="published"
		>
		<div class="imgGrid">
			<div class="imageContainer" v-for="(image, idx) in previews" :key="idx">
				<img
					class="img"
					:src="image"
					alt="Uploaded image"
				>
				<div class="removeImage" @click="removeImage(idx)">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 48 48"
						height="30"
						width="30"
						class="icon"
					>
						<path d="m12.45 37.65-2.1-2.1L21.9 24 10.35 12.45l2.1-2.1L24 21.9l11.55-11.55 2.1 2.1L26.1 24l11.55 11.55-2.1 2.1L24 26.1Z"/>
					</svg>
				</div>
			</div>
		</div>
	</div>
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
		<div v-else>
			<div class="successMsg">Poll successfully published!</div>
			<Button text="Copy Link" @click="copyLink(config.public.base + '/' + id)" />
		</div>
	</div>
</template>

<script lang="ts">
export default defineComponent({
	data() {
		return {
			config: useRuntimeConfig(),
			name: "",
			info: "**Please check out the entries and then on the bottom of this page vote for your favourites!** The entry letter (A, B, C) is assigned at the top of the image.",
			allowedVotes: 3,
			ends: "",
			expires: "",
			images: new Array<File>(),
			previews: new Array<string>(),
			dZ: HTMLInputElement,
			valid: false,
			published: false,
			working: true,
			id: "",
		};
	},
	mounted() {
		for (let item of ["name", "allowedVotes", "ends", "expires"]) {
			this.$watch(item, () => this.validate());
		}
		this.$watch("images", () => this.validate(), { deep: true });

		this.ends = toDateInputValue(addDays(new Date(), 1));
		this.expires = toDateInputValue(addDays(new Date(), 3));
	},
	methods: {
		preview(event: Event) {
			const files = (event.target as HTMLInputElement).files;
			if (files) {
				for (let i=0; i < files.length; i++) {
					const reader = new FileReader();
					reader.onload = (event) => this.previews.push(event.target?.result as string);
					reader.readAsDataURL(files[i]);
					this.images.push(files[i]);
				}
			}
		},
		validate() {
			this.valid = false;
			if (this.name === "") {
				return;
			}
			if (this.ends > this.expires) {
				return;
			}
			if (this.images.length < 1) {
				return;
			}
			if ( this.allowedVotes <= 0 || this.allowedVotes > this.images.length) {
				return;
			}
			this.valid = true;
		},
		removeImage(idx: number) {
			this.images.splice(idx, 1);
			this.previews.splice(idx, 1);
		},
		removeNewlines() {
			this.info = this.info.replaceAll(/\n/g, "");
		},
		async create() {
			this.working = true;
			const formData = new FormData();
			formData.append("name", this.name);
			formData.append("info", this.info);
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
			this.working = false;
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

.textPreview,
textarea,
input[type=text],
input[type=date],
input[type=number] {
	width: 500px;
}

label {
	width: 120px;
}

input[type=file] {
	display: none;
}

textarea {
	resize: none;
}

.textPreview {
	padding: 9px 10px;
	border: 2px solid var(--color-background--layer-10);
	border-radius: 5px;
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

.imageContainer {
	position: relative;
	margin: 20px 10px 0 0;
}

.imageContainer:hover > .removeImage {
	opacity: 1;
}

img {
	margin: auto;
	width: calc(100% - var(--image-width--border));
	width: 100%;
    outline: var(--image-width--border) solid var(--color-accent--border);
}

.removeImage {
	position: absolute;
	top: 0;
	right: 0;
	fill: var(--color-text);
	opacity: 0;
	transition: opacity var(--transition-short);
	cursor: pointer;
}

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
