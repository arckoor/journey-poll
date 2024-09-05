import { fileURLToPath, URL } from "url";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	runtimeConfig: {
		public: {
			dev: process.env.NODE_ENV !== "production",
			apiBase: process.env.NODE_ENV !== "production" ? "http://localhost:8080" : process.env.NUXT_API_BASE_URL,
			pollApiBase: process.env.NODE_ENV !== "production" ? "http://localhost:8080" : process.env.NUXT_POLL_API_BASE_URL,
			base: process.env.NODE_ENV !== "production" ? "http://localhost:3000/p" : process.env.NUXT_BASE_URL
		}
	},
	alias: {
		"components": fileURLToPath(new URL("./components", import.meta.url)),
		"utils": fileURLToPath(new URL("./utils", import.meta.url)),
		"assets": fileURLToPath(new URL("./assets", import.meta.url)),
		"css": fileURLToPath(new URL("./assets/css", import.meta.url))
	},
	css: [
		"css/style.css"
	],
	ssr: true,
	app: {
		head: {
			link: [
				{ rel: "icon", type: "icon/ico", href: "/favicon.ico" },
				{ rel: "preconnect",   href: "https://fonts.gstatic.com",    crossorigin: "" },
				{ rel: "dns-prefetch", href: "https://fonts.gstatic.com" },
				{ rel: "preconnect",   href: "https://fonts.googleapis.com", crossorigin: "" },
				{ rel: "dns-prefetch", href: "https://fonts.googleapis.com" },
				{ rel: "preconnect",   href: process.env.NUXT_API_BASE_URL,  crossorigin: "use-credentials" },
				{ rel: "dns-prefetch", href: process.env.NUXT_API_BASE_URL }
			],
			meta: [{
				name: "robots",
				content: "noindex,nofollow"
			}, {
				name: "viewport",
				content: "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
			}]
		}
	}
});
