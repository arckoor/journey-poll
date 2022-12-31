<template>
	<div @click="logout">Logout</div>
	<div @click="navigateTo('/admin/list')">Created polls</div>
	<div @click="navigateTo('/admin/create')">Create new poll</div>
	<slot />
</template>

<script lang="ts">
export default defineComponent({
	data() {
		return {
			config: useRuntimeConfig()
		};
	},
	methods: {
		async logout() {
			await fetch(this.config.public.apiBase + "/admin/logout", {
				method: "POST",
				credentials: "include"
			});
			navigateTo("/");
		}
	}
});
</script>
