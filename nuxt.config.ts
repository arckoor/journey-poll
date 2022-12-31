import { fileURLToPath, URL } from "url";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	runtimeConfig: {
		public: {
			apiBase: process.env.NUXT_API_BASE_URL || "https://api.arckoor.dev/poll",
			base: process.env.NUXT_BASE_URL || "https://poll.arckoor.dev"
		}
	},
	alias: {
		"components": fileURLToPath(new URL("./components", import.meta.url))
	},
	ssr: false
});
