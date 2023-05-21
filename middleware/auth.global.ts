export default defineNuxtRouteMiddleware(async (to) => {
	if (process.server) return;
	const config = useRuntimeConfig();
	const authState = useAuth().value;
	if (to.fullPath.startsWith("/admin")) {
		const auth = await fetch(config.public.pollApiBase + "/admin/auth", {
			method: "POST",
			credentials: "include"
		});
		const data = await auth.json();
		authState.auth = data.auth;
		authState.root = data.root;
		if (!data.auth) {
			return await navigateTo("/");
		}
		if (data.auth && !data.root && to.fullPath.startsWith("/admin/root")) {
			return await navigateTo("/admin/list");
		}
	}
	if (to.fullPath === "/admin") {
		return await navigateTo("/admin/list");
	}
});
