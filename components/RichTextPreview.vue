<script setup lang="ts">
defineProps<{
	text: string
	allowedVotes: number
}>();
</script>

<template>
	<div>
		<template v-for="(item, idx) in splits" :key="idx">
			<span v-if="item.type === 'text'">{{ item.content }}</span>
			<span v-else-if="item.type === 'bold'"><strong>{{ item.content }}</strong></span>
			<span v-else-if="item.type === 'underline'"><u>{{ item.content }}</u></span>
			<span v-else-if="item.type === 'italic'"><i>{{ item.content }}</i></span>
		</template>
		<span v-if="text">&nbsp;</span>
		<u>You may vote for up to {{ allowedVotes }} {{ allowedVotes > 1 ? "entries" : "entry" }}!</u> Thanks for your vote!
		<br /><br />
		<strong>Tap or click an image to view it in high resolution.</strong>
	</div>
</template>

<script lang="ts">
export default defineComponent({
	data() {
		return {
			splits: [] as Array<Record<string, string>>
		};
	},
	created() {
		this.$watch("text", () => this.makeSplits(this.text));
		this.makeSplits(this.text);
	},
	methods: {
		makeSplits(input: string) {
			this.splits = [];
			const regex = [
				/(\*\*[^*]+\*\*)/g,  // bold
				/(__[^_]+__)/g,	     // underline
				/((?<!_)_[^_]+_)/g	 // italic
			];
			let info = [input] as Array<string | string[]>;
			for (const re of regex) {
				const length = info.length;
				for (let i=0; i<length; i++) {
					info[i] = (info[i] as string).split(re);
					info = info.flat();
					info = info.filter(x => x != "");
				}
			}
			const finalInfo = info as Array<string>;
			for (let item of finalInfo) {
				let type ="";
				if (new RegExp(regex[0]).test(item)) {
					item = item.replaceAll("*", "");
					type = "bold";
				} else if (new RegExp(regex[1]).test(item)) {
					item = item.replaceAll("_", "");
					type = "underline";
				} else if (new RegExp(regex[2]).test(item)) {
					item = item.replaceAll("_", "");
					type = "italic";
				} else {
					type = "text";
				}
				this.splits.push({
					content: item,
					type: type
				});
			}
		}
	}
});
</script>
