<template>
	<input
		type="text"
		v-model="username"
		v-on:keydown.enter="($refs.password as HTMLElement).focus()"
	/>
	<input
		type="text"
		v-model="password"
		v-on:keydown.enter="login"
		ref="password"
	/>
	<button @click="login" :disabled="username === '' || password === ''">Login!</button>
	<div>{{ errorMessage }}</div>
</template>

<script lang="ts">
export default defineComponent({
	data() {
		return {
			username: "",
			password: "",
			config: useRuntimeConfig(),
			errorMessage: ""
		};
	},
	mounted() {
		navigateTo("/admin/list");
	},
	methods: {
		async login() {
			if (this.username === "" || this.password === "") {
				return;
			}
			const password = await this.hashPassword();
			const response = await fetch(this.config.public.apiBase + "/login", {
				method: "POST",
				credentials: "include",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					// "Access-Control-Allow-Origin": "http://localhost:8080"
				},
				body: JSON.stringify({
					username: this.username,
					password: password
				})
			});
			if (response.status === 200) {
				navigateTo("/admin/list");
			} else {
				this.errorMessage = "Invalid login credentials.";
			}
		},
		async hashPassword() {
			const salt = this.password + this.username;
			const msgUint8 = new TextEncoder().encode(salt);
			const hashBuffer = await crypto.subtle.digest("sha-256", msgUint8);
			const hashArray = Array.from(new Uint8Array(hashBuffer));
			const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
			return hashHex;
		}
	}
});
</script>
