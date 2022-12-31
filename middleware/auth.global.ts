export default defineNuxtRouteMiddleware(async (to) => {
	const config = useRuntimeConfig();
	if (to.fullPath.startsWith("/admin")) {
		const auth = await fetch(config.public.apiBase + "/admin/auth", {
			method: "POST",
			credentials: "include"
		});
		if (!(auth.status === 200)) {
			return navigateTo("/");
		}
	}
});
