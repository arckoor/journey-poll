<template>
	<div class="container">
		<div class="inputContainer">
			<label for="username">Username:</label>
			<input
				spellcheck="false"
				type="text"
				v-model="username"
				v-on:keydown.enter="($refs.password as HTMLElement).focus()"
				id="username"
				name="username"
				placeholder="Enter your username..."
			/>
		</div>
		<div class="inputContainer">
			<label for="password">Password:</label>
			<input
				type="password"
				v-model="password"
				v-on:keydown.enter="login"
				ref="password"
				id="password"
				name="password"
				placeholder="Enter your password..."
			/>
		</div>
		<div class="loginContainer">
			<Button
				class="login"
				text="Login!"
				:disabled="username === '' || password === ''"
				@click="login"
			/>
			<div class="error">{{ errorMessage }}</div>
		</div>
		<div ref="tooltip" :class="'toolTip no-select '" @click="tooltipEnabled = !tooltipEnabled">
			How can I make an account?
			<span :class="'toolTipContent '+ (tooltipEnabled ? 'reveal' : '')">
				Currently, accounts are created on a per-request basis.
				If you'd like to use this service, please contact arckoor#6568 in the Journey Discord.
			</span>
		</div>
	</div>
</template>

<script lang="ts">
export default defineComponent({
	data() {
		return {
			username: useUsername(),
			password: "",
			config: useRuntimeConfig(),
			errorMessage: "",
			tooltipEnabled: false
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
			const response = await fetch(this.config.public.pollApiBase + "/login", {
				method: "POST",
				credentials: "include",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					username: this.username,
					password: password
				})
			});
			if (response.status === 200) {
				navigateTo("/admin/list");
			} else if (response.status === 429) {
				this.errorMessage = "You are being rate limited.";
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

<style scoped>
.container {
	display: flex;
	flex-direction: column;
	align-items: center;
	height: 100vh;
	justify-content: center;
}

.inputContainer {
	display: flex;
	flex-direction: row;
	padding: 20px 0;
	font-size: var(--font-size--content);
	align-items: center;
}

label {
	width: 120px;
	padding-right: 25px;
}

.loginContainer {
	margin-top: 40px;
}

.login {
	padding: 10px 40px;
	margin: 0 5px;
}

.error {
	color: var(--color-primary--hover);
	margin-top: 20px;
}

.toolTip {
	margin-top: 30px;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	cursor: pointer;
}

.toolTipContent {
	width: 400px;
	display: none;
	position: absolute;
	padding-top: 50px;
}

.reveal {
	display: block;
}

a,
a:visited {
	color: var(--color-primary--hover);
	text-decoration: none;
}
</style>
