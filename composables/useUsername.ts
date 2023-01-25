export default function() {
	return useCookie("username", {
		secure: true,
		sameSite: "strict",
		maxAge: 31536000,
		default: () => ""
	});
}
