import { fileURLToPath, URL } from "url";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	alias: {
		"components": fileURLToPath(new URL("./components", import.meta.url))
	}
});
