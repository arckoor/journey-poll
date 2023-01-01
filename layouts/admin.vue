<template>
	<Title>Journey Polls - ADMIN</Title>
	<div class="header">
		<NuxtLink to="/admin/list" class="headerItem" v-if="$route.path !== '/admin/list'">Created polls</NuxtLink>
		<NuxtLink to="/admin/create" class="headerItem" v-if="$route.path !== '/admin/create'">Create new poll</NuxtLink>
		<div @click="logout" class="headerItem">Logout</div>
	</div>

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

<style scoped>
.header {
	padding: 20px;
	display: flex;
	text-align: center;
	font-size: 30px;
	display: flex;
	flex-direction: row;
}

.headerItem {
	flex-basis: 50%;
	margin: 10px 25px 10px 25px;
	padding: 10px 20px 10px 20px;
	border-radius: 5px;
	border: 2px solid var(--border);
	width: fit-content;
	cursor: pointer;
	transition: background var(--hover-transition);
}

.headerItem:hover {
	background-color: var(--border);
}
</style>
