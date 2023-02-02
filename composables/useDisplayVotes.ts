export default function() {
	const cookie =  useCookie("displayVotes", {
		secure: true,
		sameSite: "strict",
		maxAge: 31536000,
		default: () => false
	});
	return cookie;
}
