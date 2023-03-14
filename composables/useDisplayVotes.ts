export default function() {
	return useCookie("displayVotes", {
		secure: true,
		sameSite: "strict",
		maxAge: 31536000,
		default: () => false
	});
}
