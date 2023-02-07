export function trimExt(input: string) {
	return input.replace(/\.[^/.]+$/, "");
}
