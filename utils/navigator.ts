export function copyLink(msg: string) {
	if (!navigator.clipboard) {
		return;
	}
	navigator.clipboard.writeText(msg);
}
