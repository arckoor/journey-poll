import { Request, Response } from "express";
import { AuthenticatedRequest } from "../interfaces/express.interface.js";
import { Poll, User, Admin } from "../models/poll.model.js";
import { checkPassword, getIp, uniqueId } from "../utils/security.helper.js";
import { deleteFile,  trimExt } from "../utils/fs.helper.js";
import { calculateAspectRatio } from "../utils/math.helper.js";
import { adminLog } from "../utils/log.helper.js";
import { fileNameLength, pollIdLength, imagePath, adminCookieLength, allowedSettings } from "../configs/poll.config.js";
import { TSettings } from "../interfaces/poll.interface.js";
import { imageSize } from "image-size";
import { copyFile } from "fs/promises";

// method: POST
async function login(req: Request, res: Response) {
	try {
		res.startTime("dbQuery", "Database query");
		const doc = await Admin.findOne({ username: req.body.username });
		res.endTime("dbQuery");
		if (doc) {
			if (await checkPassword(req.body.password, doc.password)) {
				const cookie = await uniqueId(adminCookieLength, "url-safe", "adminCookie");
				doc.cookie = cookie;
				doc.lastRequest = new Date();
				await doc.save();
				res.cookie("adminId", cookie, {
					sameSite: "strict",
					secure: true,
					httpOnly: true
				});
				adminLog.info(`Successful login from ${await getIp(req)} with username ${req.body.username}`);
				return res.send(JSON.stringify({
					auth: true
				}));
			}
		}
		adminLog.warn(`Failed /login attempt from ${await getIp(req)} with username ${req.body.username}`);
		return res.send(JSON.stringify({
			auth: false
		}));
	} catch (e) {
		adminLog.error(`Error in POST: login by ${req.body.username}: ${e}`);
		res.sendStatus(500);
	}
}

// method: POST
async function adminLogout(req: AuthenticatedRequest, res: Response) {
	try {
		const cookie = req.cookies.adminId;
		res.startTime("dbQuery", "Database query");
		const doc = await Admin.findOne({ cookie: cookie });
		res.endTime("dbQuery");
		if (!doc) {
			return res.sendStatus(400);
		}
		doc.cookie = "";
		await doc.save();
		res.cookie("adminId", "", {
			expires: new Date(0)
		});
		res.sendStatus(200);
		adminLog.info(`Successful logout from ${await getIp(req)} with username ${doc.username}`);
	} catch (e) {
		adminLog.error(`Error in POST: /admin/adminLogout by ${req.body.username}: ${e}`);
		res.sendStatus(500);
	}
}

// method: POST
async function adminAuth(req: AuthenticatedRequest, res: Response) {
	res.send(JSON.stringify({
		auth: true,
		root: req.auth.isRoot
	}));
}

// method: POST
async function adminCreatePoll(req: AuthenticatedRequest, res: Response) {
	try {
		res.startTime("proc", "Data processing");
		const pollId = await uniqueId(pollIdLength, "alphanumeric", "pollId");
		const files = new Array<string>();
		const originalNames = {};
		const votes = {};
		const aspects = {};
		for (const file of req.files as Express.Multer.File[]) {
			files.push(file.filename);
			originalNames[trimExt(file.filename)] = file.originalname;
			votes[trimExt(file.filename)] = 0;
			const dimensions = imageSize(imagePath + file.filename);
			const aspect = calculateAspectRatio(dimensions.width, dimensions.height);
			aspects[trimExt(file.filename)] = aspect;
		}
		res.endTime("proc");
		res.startTime("dbCreate", "Database create");
		const doc = new Poll({
			id: pollId,
			createdBy: req.auth.admin,
			name: req.body.name,
			info: req.body.info,
			images: files,
			originalNames: originalNames,
			votes: votes,
			aspectRatios: aspects,
			allowedVotes: req.body.allowedVotes,
			voteAmount: 0,
			public: false,
			ends: req.body.ends,
			expires: req.body.expires
		});
		await doc.save();
		res.endTime("dbCreate");
		res.send(JSON.stringify(pollId));
		adminLog.info(`Poll ${pollId} created by ${req.auth.admin} - { name: ${req.body.name}, ends: ${req.body.ends}, expires: ${req.body.expires}, imageAmount: ${files.length} }`);
	} catch (e) {
		adminLog.error(`Error in POST: /admin/adminCreatePoll by ${req.auth.admin}: ${e}`);
		res.sendStatus(500);
	}
}

// method: GET
async function adminGetPoll(req: AuthenticatedRequest, res: Response) {
	try {
		res.startTime("dbQuery", "Database query");
		const doc = await Poll.findOne({ id: req.params.id });
		res.endTime("dbQuery");
		if (!doc) {
			return res.sendStatus(404);
		}
		res.send(JSON.stringify({
			name: doc.name,
			info: doc.info,
			allowedVotes: doc.allowedVotes,
			ends: doc.ends,
			expires: doc.expires,
			images: doc.images
		}));
	} catch (e) {
		adminLog.error(`Error in GET: /admin/adminGetPoll by ${req.params.id}: ${e}`);
		res.sendStatus(500);
	}
}

// method: POST
async function adminEditPoll(req: AuthenticatedRequest, res: Response) {
	try {
		res.startTime("dbQuery", "Database query");
		const doc = await Poll.findOne({ id: req.params.id });
		res.endTime("dbQuery");
		if (!doc) {
			return res.sendStatus(404);
		}
		res.startTime("proc", "Data processing");
		if (req.body.name) doc.name = req.body.name;
		if (req.body.info) doc.info = req.body.info;
		if (req.body.allowedVotes) doc.allowedVotes = req.body.allowedVotes;
		if (req.body.ends) doc.ends = req.body.ends;
		if (req.body.expires) doc.expires = req.body.expires;
		if (req.body.removedImages) {
			if (typeof req.body.removedImages === "string") {
				req.body.removedImages = [req.body.removedImages];
			}
			for (const image of req.body.removedImages) {
				const index = doc.images.indexOf(image);
				if (index === -1) {
					continue;
				}
				doc.votes.delete(trimExt(image));
				doc.aspectRatios.delete(trimExt(image));
				doc.images.splice(index, 1);
				await deleteFile(imagePath + image);
			}
		}
		for (const file of req.files as Express.Multer.File[]) {
			doc.images.push(file.filename);
			doc.votes.set(trimExt(file.filename), 0);
			const dimensions = imageSize(imagePath + file.filename);
			const aspect = calculateAspectRatio(dimensions.width, dimensions.height);
			doc.aspectRatios.set(trimExt(file.filename), aspect);
		}
		await doc.save();
		res.endTime("proc");
		res.sendStatus(200);
		adminLog.info(`Poll ${req.params.id} edited by ${req.auth.admin} - { name: ${req.body.name}, ends: ${req.body.ends}, expires: ${req.body.expires}, removedImages: ${req.body.removedImages}, imageAmount: ${req.files.length} }`);
	} catch (e) {
		adminLog.error(`Error in POST: /admin/adminEditPoll by ${req.params.id}: ${e}`);
		res.sendStatus(500);
	}
}

// method: POST
async function adminGenerateTiebreakerPoll(req: AuthenticatedRequest, res: Response) {
	try {
		res.startTime("dbQuery", "Database query");
		const doc = await Poll.findOne({ id: req.params.id });
		res.endTime("dbQuery");
		if (!doc) {
			return res.sendStatus(404);
		} else if (Date.now() < new Date(doc.ends).getTime()) {
			return res.sendStatus(400);
		}
		res.startTime("proc", "Data processing");
		const pollId = await uniqueId(pollIdLength, "alphanumeric", "pollId");
		const files = new Array<string>();
		const max = Math.max(...doc.votes.values());
		for (const [key, value] of doc.votes.entries()) {
			if (value === max) {
				for (const image of doc.images) {
					if (trimExt(image) === key) {
						files.push(image);
						break;
					}
				}
			}
		}
		const originalNames = {};
		const votes = {};
		const aspects = {};
		const newFiles = new Array<string>();
		for (const file of files) {
			const newFileName = await uniqueId(fileNameLength, "alphanumeric", "filename", `.${file.split(".").pop()}`);
			await copyFile(imagePath + file, imagePath + newFileName);
			newFiles.push(newFileName);
			originalNames[trimExt(newFileName)] = doc.originalNames.get(trimExt(file));
			aspects[trimExt(newFileName)] = doc.aspectRatios.get(trimExt(file));
			votes[trimExt(newFileName)] = 0;
		}
		const endDate = new Date(doc.ends);
		const newEndDate = endDate.setDate(endDate.getDate() + 2);
		const expiresDate = new Date(doc.expires);
		const newExpiresDate = expiresDate.setDate(expiresDate.getDate() + 7);
		res.endTime("proc");
		res.startTime("dbCreate", "Database create");
		const newDoc = new Poll({
			id: pollId,
			createdBy: `${req.auth.admin} | SYSTEM`,
			name: "Tiebreaker Vote - " + doc.name,
			info: doc.info,
			images: newFiles,
			originalNames: originalNames,
			votes: votes,
			aspectRatios: aspects,
			allowedVotes: 1,
			voteAmount: 0,
			public: false,
			ends: newEndDate,
			expires: newExpiresDate
		});
		await newDoc.save();
		res.endTime("dbCreate");
		res.send(JSON.stringify(pollId));
		adminLog.info(`Tiebreaker ${pollId} for poll ${req.params.id} generated by ${req.auth.admin}`);
	} catch (e) {
		adminLog.error(`Error in POST: /admin/adminGenerateTiebreakerPoll by ${req.params.id}: ${e}`);
		res.sendStatus(500);
	}
}

// method: DELETE
async function adminDeletePoll(req: AuthenticatedRequest, res: Response) {
	await deletePoll(req.params.id, req, res);
}

// method: GET
async function adminGetPolls(req: AuthenticatedRequest, res: Response) {
	try {
		const data = {};
		res.startTime("dbQuery", "Database Query");
		for (const item of await Poll.find({ })) {
			data[item.id] = {
				name: item.name,
				createdBy: item.createdBy,
				voteAmount: item.voteAmount,
				ends: item.ends,
				expires: item.expires
			};
		}
		res.endTime("dbQuery");
		res.send(JSON.stringify(data));
	} catch (e) {
		adminLog.error(`Error in GET: /admin/adminGetPolls by ${req.auth.admin}: ${e}`);
		res.sendStatus(500);
	}
}

// method: GET
async function adminGetResults(req: AuthenticatedRequest, res: Response) {
	try {
		res.startTime("dbQuery", "Database Query");
		const doc = await Poll.findOne({ id: req.params.id });
		res.endTime("dbQuery");
		if (!doc) {
			return res.sendStatus(404);
		}
		const inProgress = Date.now() < new Date(doc.ends).getTime();
		const data = {
			name: doc.name,
			images: doc.images,
			aspectRatios: doc.aspectRatios,
			voteAmount: doc.voteAmount,
			votes: doc.votes,
			public: doc.public,
			inProgress: inProgress
		};
		res.send(JSON.stringify(data));
	} catch (e) {
		adminLog.error(`Error in GET: /admin/adminGetResults by ${req.params.id}: ${e}`);
		res.sendStatus(500);
	}
}

// method: POST
async function adminPublishResults(req: AuthenticatedRequest, res: Response) {
	try {
		res.startTime("dbQuery", "Database query");
		const doc = await Poll.findOne({ id: req.params.id });
		res.endTime("dbQuery");
		if (!doc) {
			return res.sendStatus(404);
		}
		doc.public = true;
		await doc.save();
		res.sendStatus(200);
		adminLog.info(`Results of poll ${req.params.id} published by ${req.auth.admin}`);
	} catch (e) {
		adminLog.error(`Error in POST: /admin/adminPublishResults by ${req.params.id}: ${e}`);
		res.sendStatus(500);
	}
}

// method: POST
async function adminUnpublishResults(req: AuthenticatedRequest, res: Response) {
	try {
		res.startTime("dbQuery", "Database query");
		const doc = await Poll.findOne({ id: req.params.id });
		res.endTime("dbQuery");
		if (!doc) {
			res.sendStatus(404);
		}
		doc.public = false;
		await doc.save();
		res.sendStatus(200);
		adminLog.info(`Results of poll ${req.params.id} unpublished by ${req.auth.admin}`);
	} catch (e) {
		adminLog.error(`Error in POST: /admin/adminUnpublishResults by ${req.params.id}: ${e}`);
		res.sendStatus(500);
	}
}

// method: GET
async function adminGetSettings(req: AuthenticatedRequest, res: Response) {
	try {
		res.startTime("dbQuery", "Database query");
		const doc = await Admin.findById(req.auth.id);
		res.endTime("dbQuery");
		res.send(JSON.stringify(doc.settings));
	} catch (e) {
		adminLog.error(`Error in POST: /admin/adminGetSettings by ${req.params.id} : ${e}`);
		res.sendStatus(500);
	}
}

// method: POST
async function adminSetSettings(req: AuthenticatedRequest, res: Response) {
	try {
		res.startTime("dbQuery", "Database query");
		const doc = await Admin.findById(req.auth.id);
		res.endTime("dbQuery");
		const s = req.body;
		const setValue = (str: TSettings) => { if (s[str] || s[str] == "") doc.settings.set(str, s[str]); };
		for (const key of allowedSettings) {
			setValue(key);
		}
		await doc.save();
		res.sendStatus(200);
		adminLog.info(`Settings updated for ${req.auth.admin}`);
	} catch(e) {
		adminLog.error(`Error in POST: /admin/adminSetSettings by ${req.params.id} : ${e}`);
		res.sendStatus(500);
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function deletePoll(id: string, req?: AuthenticatedRequest, res?: Response) {
	try {
		res?.startTime("dbQuery", "Database query");
		const doc = await Poll.findOneAndDelete({ id: id });
		res?.endTime("dbQuery");
		if (!doc) {
			res?.sendStatus(404);
			return;
		}
		res?.startTime("deleteFiles", "Delete files");
		for (const file of doc.images) {
			await deleteFile(imagePath + file);
		}
		res?.endTime("deleteFiles");
		res?.startTime("deleteUsers", "Delete users");
		if (!(await Poll.find({ })).length) {
			await User.deleteMany({ });
			res?.sendStatus(200);
			res.endTime("deleteUsers");
			return;
		}
		res?.endTime("deleteUsers");
		res?.startTime("deleteVotes", "Delete votes");
		for (const user of await User.find({ })) {
			user.votes.delete(id);
			await user.save();
			if (user.votes.size === 0) {
				await user.deleteOne();
			}
		}
		res?.endTime("deleteVotes");
		res?.sendStatus(200);
		adminLog.info(`Poll ${id} deleted by ${req ? req.auth.admin : "SYSTEM"}`);
	} catch (e) {
		adminLog.error(`Error in DELETE: /admin/deletePoll by ${req ? req.auth.admin : "SYSTEM"}: ${e}`);
		res?.sendStatus(500);
	}
}

export default {
	login,
	adminLogout,
	adminAuth,
	adminCreatePoll,
	adminGetPoll,
	adminEditPoll,
	adminDeletePoll,
	adminGetPolls,
	adminGetResults,
	adminPublishResults,
	adminUnpublishResults,
	adminGenerateTiebreakerPoll,
	adminGetSettings,
	adminSetSettings
};
