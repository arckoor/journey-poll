<template>
	<div class="container">
		<div class="input-wrapper">
			<div class="input-container">
				<label for="username">Username:</label>
				<input
					spellcheck="false"
					type="text"
					v-model="username"
					v-on:keydown.enter="($refs.password as HTMLElement).focus()"
					id="username"
					name="username"
					placeholder="Enter your username..."
					autocomplete="username"
				/>
			</div>
			<div class="input-container">
				<label for="password">Password:</label>
				<input
					:type="pwType"
					v-model="password"
					v-on:keydown.enter="login"
					ref="password"
					id="password"
					name="password"
					placeholder="Enter your password..."
					autocomplete="current-password"
				/>
				<div class="visibility-toggle no-select">
					<SvgVisibility v-if="pwType == 'password'" @click="toggleVisibility" />
					<SvgVisibilityLock v-else @click="toggleVisibility" />
				</div>
			</div>
		</div>
		<div class="login-container">
			<Button
				class="login"
				text="Login!"
				:disabled="username === '' || password === ''"
				@click="login"
			/>
			<div class="error">{{ errorMessage }}</div>
		</div>
		<div ref="tooltip" :class="'tool-tip no-select '" @click="tooltipEnabled = !tooltipEnabled">
			How can I make an account?
			<span :class="'tool-tip--content '+ (tooltipEnabled ? 'reveal' : '')">
				Currently, accounts are issued on a per-request basis.
				If you'd like to use this service, please contact arckoor in the Journey Discord.
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
			tooltipEnabled: false,
			pwType: "password"
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
			const res = await fetch(this.config.public.pollApiBase + "/login", {
				method: "POST",
				credentials: "include",
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					username: this.username,
					password: this.password
				})
			});
			if (res.ok) {
				const data = await res.json();
				if (data.auth) {
					await navigateTo("/admin/list");
				} else {
					this.errorMessage = "Invalid login credentials.";
				}
			} else {
				if (res.status === 429) {
					this.errorMessage = "You are being rate limited.";
				} else {
					this.errorMessage = "Something went wrong :/";
				}
			}
		},
		toggleVisibility() {
			this.pwType = this.pwType === "password" ? "text" : "password";
		}
	}
});
</script>

<style scoped>
@media only screen and (max-width: 599px) {
	.input-container {
		flex-direction: column;
	}
	.input-container > label {
		align-self: flex-start;
		margin: 0 0 10px 0;
	}
}

.container {
	display: flex;
	flex-direction: column;
	align-items: center;
	height: 100vh;
	justify-content: center;
}

.input-wrapper {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
}

.input-container {
	display: flex;
	padding: 20px 0;
	font-size: var(--font-size--content);
	align-items: center;
}

label {
	width: 120px;
	padding-right: 25px;
}

.visibility-toggle {
	display: flex;
	justify-content: center;
	align-items: center;
	margin-left: 10px;
	cursor: pointer;
}

.login-container {
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

.tool-tip {
	margin-top: 30px;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;
	cursor: pointer;
}

.tool-tip--content {
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
