import { Response } from "express";
import { UserRequest } from "../interfaces/express.interface.js";
import { getIp, uniqueId } from "../utils/security.helper.js";
import { userCookieLength } from "../configs/poll.config.js";
import { User } from "../models/poll.model.js";
import { userLog } from "../utils/log.helper.js";

export async function trace(req: UserRequest, res: Response, next: () => void) {
	try {
		const ip = await getIp(req);
		let userDoc = await User.findOne({ ip: ip });
		if (!userDoc && req.cookies.userId) {
			userDoc = await User.findOne({ cookie: req.cookies.userId });
		}
		let cookie: string;
		if (!userDoc) {
			cookie = await uniqueId(userCookieLength, "alphanumeric", "userCookie");
			userDoc = new User({ ip: ip, votes: {}, cookie: cookie });
		} else {
			if (ip !== userDoc.ip) {
				userDoc.ip = ip;
			}
			cookie = userDoc.cookie;
		}
		await userDoc.save();
		res.cookie("userId", cookie, {
			sameSite: "strict",
			secure: true,
			httpOnly: true,
			maxAge: 1000 * 60 * 60 * 24 * 365 * 10
		});
		req.auth = {
			id: userDoc._id
		};
		return next();
	} catch (e) {
		userLog.error(`Error in MIDDLEWARE: trace by ${getIp(req)}: ${e}`);
		res.sendStatus(500);
	}
}
