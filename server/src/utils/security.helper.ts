import { Request } from "express";
import { subtle } from "crypto";
import { Admin, User, Poll } from "../models/poll.model.js";
import { imagePath, bcryptSaltRounds } from "../configs/poll.config.js";
import { exists } from "./fs.helper.js";
import bcrypt from "bcrypt";
import cryptoRandomString from "crypto-random-string";

export async function digestMessage(message: string, algorithm: "sha-256" | "sha-512" = "sha-256") {
	const msgUint8 = new TextEncoder().encode(message);
	const hashBuffer = await subtle.digest(algorithm, msgUint8);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
	return hashHex;
}

export async function hashPassword(password: string) {
	return await bcrypt.hash(password, bcryptSaltRounds);
}

export async function checkPassword(password: string, hash: string) {
	return await bcrypt.compare(password, hash);
}

export async function getIp(req: Request) {
	const ip = ((req.headers["cf-connecting-ip"] || req.headers["x-forwarded-for"] || req.socket.remoteAddress || "") as string).split(",")[0].trim();
	return await digestMessage(ip);
}

export async function uniqueId(
	length: number,
	type: "hex" | "base64" | "url-safe" | "numeric" | "distinguishable" | "ascii-printable" | "alphanumeric",
	compare: "filename" | "adminCookie" | "userCookie" | "pollId",
	ext?: string
) {
	const limit = 1000;
	let runs = 0;
	while (runs < limit) {
		const tail = ext ? ext : "";
		const str = cryptoRandomString({ length: length, type: type }) + tail;
		switch (compare) {
			case "filename":
				if (!(await exists(imagePath + str))) {
					return str;
				}
				break;
			case "adminCookie":
				if (!(await Admin.findOne({ cookie: str }))) {
					return str;
				}
				break;
			case "userCookie":
				if (!(await User.findOne({ cookie: str }))) {
					return str;
				}
				break;
			case "pollId":
				if (!(await Poll.findOne({ id: str }))) {
					return str;
				}
				break;
		}
		runs += 1;
	}
	throw new Error("Could not generate unique ID");
}
