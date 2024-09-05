import { Response } from "express";
import { AuthenticatedRequest } from "../interfaces/express.interface.js";
import { Admin } from "../models/poll.model.js";
import { adminLog } from "../utils/log.helper.js";

export async function authenticate(req: AuthenticatedRequest, res: Response, next: () => void) {
	try {
		const cookie = req.cookies.adminId;
		if (cookie) {
			const doc = await Admin.findOne({ cookie: cookie });
			if (doc && doc.cookie !== "" && doc.cookie === cookie) {
				doc.lastRequest = new Date();
				await doc.save();
				req.auth = {
					admin: doc.username,
					id: doc._id,
					isRoot: doc.isRoot
				};
				if (req.path.startsWith("/root")) {
					if (doc.isRoot) {
						return next();
					} else {
						return res.send(JSON.stringify({
							auth: true,
							root: false
						}));
					}
				} else {
					return next();
				}
			}
		}
		return res.send(JSON.stringify({
			auth: false,
			root: false
		}));
	} catch (e) {
		adminLog.error(`Error in MIDDLEWARE: authenticate by ${req.auth.admin}: ${e}`);
		res.sendStatus(500);
	}
}
