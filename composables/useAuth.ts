export default function() {
	return useState("auth", () => ({
		auth: false,
		root: false
	}));
}
