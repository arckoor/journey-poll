import { unlink, access, constants } from "fs/promises";

export async function deleteFile(path: string) {
	await unlink(path);
}

export function trimExt(input: string) {
	return input.replace(/\.[^/.]+$/, "");
}

export function imageWithExtension(images: Array<string>, key: string) {
	const image = images.find((image) => trimExt(image) === key);
	if (image) {
		return image;
	}
	return "";
}

export async function exists(path: string) {
	return await access(path, constants.F_OK)
		.then(() => true)
		.catch(() => false);
}
