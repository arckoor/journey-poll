import { fileURLToPath, URL } from "url";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	runtimeConfig: {
		public: {
			apiBase: process.env.NODE_ENV !== "production" ? "http://localhost:8080/poll" : process.env.NUXT_API_BASE_URL,
			base: process.env.NODE_ENV !== "production" ? "http://localhost:3000" : process.env.NUXT_BASE_URL
		}
	},
	alias: {
		"components": fileURLToPath(new URL("./components", import.meta.url)),
		"css": fileURLToPath(new URL("./assets/css", import.meta.url))
	},
	css: [
		"css/style.css"
	]
});
