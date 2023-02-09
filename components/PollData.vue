<script setup lang="ts">
defineProps<{
	pPollName: string,
	pPollInfo: string,
	pAllowedVotes: number,
	pEnds: string,
	pExpires: string,
	pPreviews: string[],
	disabled: boolean,
	validCallback: (valid: boolean) => void
}>();
</script>

<template>
	<div class="inputContainer">
		<div class="inputItem">
			<label for="pollName">Poll name:</label>
			<input
				type="text"
				id="pollName"
				v-model="name"
				:disabled="disabled"
			>
		</div>
		<div class="inputItem">
			<label for="pollInfo">Poll info:</label>
			<textarea
				rows="5"
				id="pollInfo"
				v-model="info"
				:disabled="disabled"
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
				:disabled="disabled"
			>
		</div>
		<div class="inputItem">
			<label for="pollEnd">Poll end:</label>
			<input
				type="datetime-local"
				id="pollEnd"
				:min="toDateInputValue(addDays(new Date(), 1))"
				v-model="ends"
				:disabled="disabled"
			>
		</div>
		<div class="inputItem">
			<label for="pollExpiry">Poll expiry:</label>
			<input
				type="datetime-local"
				id="pollExpiry"
				:min="ends"
				v-model="expires"
				:disabled="disabled"
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
			accept=".png,.jpg,.jpeg,.webp,.svg"
			@change="preview"
			:disabled="disabled"
		>
		<div class="imgGrid">
			<div class="imageContainer" v-for="(image, idx) in previews" :key="image">
				<CDNImg
					class="img"
					:src="image"
					sizes="310px"
					alt="Uploaded image"
					:from-client="idx >= outsideIndex"
				/>
				<div class="removeImage" @click="removeImage(idx)" v-if="!disabled">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 48 48"
						height="30"
						width="30"
					>
						<path d="m12.45 37.65-2.1-2.1L21.9 24 10.35 12.45l2.1-2.1L24 21.9l11.55-11.55 2.1 2.1L26.1 24l11.55 11.55-2.1 2.1L24 26.1Z"/>
					</svg>
				</div>
			</div>
		</div>
	</div>
	<div class="errorMessage">{{ errorMessage }}</div>
</template>

<script lang="ts">
export default defineComponent({
	emits: ["interface"],
	data() {
		return {
			name: "",
			info: "",
			allowedVotes: 0,
			ends: "",
			expires: "",
			images: new Array<File>(),
			previews: new Array<string>(),
			removedImages: new Array<string>(),
			errorMessage: "",
			outsideIndex: -1
		};
	},
	mounted() {
		this.name = this.pPollName;
		this.info = this.pPollInfo;
		this.allowedVotes = this.pAllowedVotes;
		this.ends = toLocalTimeZone(new Date(this.pEnds));
		this.expires = toLocalTimeZone(new Date(this.pExpires));
		this.previews = this.pPreviews;
		this.outsideIndex = this.previews.length;

		for (let item of ["name", "allowedVotes", "ends", "expires", "info"]) {
			this.$watch(item, () => this.validate());
		}
		this.$watch("previews", () => this.validate(), { deep: true });
		this.$emit("interface", {
			dataInterface: () => this.getData()
		});
	},
	methods: {
		preview(event: Event) {
			const files = (event.target as HTMLInputElement).files;
			if (files) {
				let len = files.length;
				for (let i=0; i < len; i++) {
					if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(files[i].type)) {
						continue;
					}
					const reader = new FileReader();
					reader.onload = event => {
						this.previews.push(event.target?.result as string);
						this.images.push(files[i]);
					};
					reader.readAsDataURL(files[i]);
				}
			}
		},
		removeNewlines() {
			this.info = this.info.replaceAll(/\n/g, "");
		},
		removeImage(idx: number) {
			this.images.splice(idx, 1);
			const img = this.previews.splice(idx, 1);
			if (idx < this.outsideIndex) {
				this.removedImages.push(img[0].split("/").at(-1) as string);
				this.outsideIndex--;
			}
		},
		assignError(error: string) {
			if (this.errorMessage == "") {
				this.errorMessage = error;
			}
		},
		validate() {
			let valid = true;
			this.errorMessage = "";
			if (this.name === "") {
				valid = false;
				this.assignError("Poll name must not be empty.");
			}
			if (this.ends >= this.expires) {
				valid = false;
				this.assignError("Poll cannot expire before it ends.");
			}
			if (this.previews.length < 1) {
				valid = false;
				this.assignError("At least one image is required.");
			}
			if (this.allowedVotes <= 0 || this.allowedVotes > this.previews.length) {
				valid = false;
				this.assignError("Number of votes cannot be larger than number of images provided.");
			}
			this.validCallback(valid);
		},
		getData() {
			return {
				name: this.name,
				info: this.info,
				allowedVotes: this.allowedVotes,
				ends: this.ends,
				expires: this.expires,
				images: this.images,
				removedImages: this.removedImages
			};
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
input[type=datetime-local],
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

.imgGrid {
	margin-top: 20px;
	display: grid;
	grid-template-columns: auto auto auto;
}

.imageContainer {
	position: relative;
	margin: 10px 10px;
}

.imageContainer:hover > .removeImage {
	opacity: 1;
}

.img {
	margin: auto;
	width: 310px;
}

.removeImage {
	position: absolute;
	top: 0;
	right: 0;
	padding-top: var(--image-width--border);
	fill: var(--color-text);
	opacity: 0;
	transition: opacity var(--transition-short);
	cursor: pointer;
}

.errorMessage {
	display: flex;
	justify-content: center;
	align-items: center;
	color: var(--color-primary--hover)
}
</style>
