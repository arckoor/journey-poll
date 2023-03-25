export default defineNuxtRouteMiddleware(async (to) => {
	if (process.server) return;
	const config = useRuntimeConfig();
	if (to.fullPath.startsWith("/admin")) {
		const auth = await fetch(config.public.pollApiBase + "/admin/auth", {
			method: "POST",
			credentials: "include"
		});
		const data = await auth.json();
		if (!data.auth) {
			return await navigateTo("/");
		}
	}
	if (to.fullPath === "/admin") {
		return await navigateTo("/admin/list");
	}
});
