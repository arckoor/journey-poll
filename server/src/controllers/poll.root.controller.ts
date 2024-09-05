import { Response } from "express";
import { AuthenticatedRequest } from "../interfaces/express.interface.js";
import { Poll, Admin } from "../models/poll.model.js";
import { hashPassword, uniqueId } from "../utils/security.helper.js";
import { trimExt } from "../utils/fs.helper.js";
import { fileNameLength, pollIdLength, imagePath } from "../configs/poll.config.js";
import { rootLog } from "../utils/log.helper.js";
import { copyFile } from "fs/promises";

// method: POST
async function rootDuplicatePoll(req: AuthenticatedRequest, res: Response) {
	try {
		res.startTime("dbQuery", "Database query");
		const doc = await Poll.findOne({ id: req.params.id });
		res.endTime("dbQuery");
		if (!doc) {
			res.sendStatus(404);
			return;
		}
		res.startTime("proc", "Data processing");
		const originalNames = {};
		const votes = {};
		const aspects = {};
		const files = new Array<string>();
		for (const file of doc.images) {
			const fileName = await uniqueId(fileNameLength, "alphanumeric", "filename", `.${file.split(".").pop()}`);
			await copyFile(imagePath + file, imagePath + fileName);
			files.push(fileName);
			originalNames[trimExt(fileName)] = doc.originalNames.get(trimExt(file));
			votes[trimExt(fileName)] = doc.votes.get(trimExt(file));
			aspects[trimExt(fileName)] = doc.aspectRatios.get(trimExt(file));
		}
		const pollId = await uniqueId(pollIdLength, "alphanumeric", "pollId");
		const newDoc = new Poll({
			id: pollId,
			createdBy: doc.createdBy,
			name: doc.name + " (copy)",
			info: doc.info,
			images: files,
			originalNames: originalNames,
			votes: votes,
			aspectRatios: aspects,
			allowedVotes: doc.allowedVotes,
			voteAmount: doc.voteAmount,
			public: doc.public,
			ends: doc.ends,
			expires: doc.expires
		});
		await newDoc.save();
		res.endTime("proc");
		res.sendStatus(200);
		rootLog.info(`Poll ${req.params.id} duplicated by ${req.auth.admin}`);
	} catch (e) {
		rootLog.error(`Error in POST: /root/duplicatePoll by ${req.auth.admin}: ${e}`);
		res.sendStatus(500);
	}
}

// method: GET
async function rootGetAdmins(req: AuthenticatedRequest, res: Response) {
	try {
		const data = {};
		res.startTime("dbQuery", "Database query");
		for (const item of await Admin.find({ })) {
			data[item.username] = {
				id: item._id,
				isRoot: item.isRoot,
				loggedIn: item.cookie !== ""
			};
		}
		res.endTime("dbQuery");
		res.send(JSON.stringify(data));
	} catch (e) {
		rootLog.error(`Error in GET: /root/getAdmins by ${req.auth.admin}: ${e}`);
		res.sendStatus(500);
	}
}

// method: POST
async function rootCreateAdmin(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.body.username || !req.body.password) {
			res.sendStatus(400);
			return;
		}
		res.startTime("dbCreate", "Database create");
		const doc = new Admin({
			username: req.body.username,
			password: await hashPassword(req.body.password),
			cookie: "",
			isRoot: false,
			settings: {}
		});
		await doc.save();
		res.endTime("dbCreate");
		res.sendStatus(200);
		rootLog.info(`Admin ${req.body.username} created by ${req.auth.admin}`);
	} catch (e) {
		rootLog.error(`Error in POST: /root/createAdmin by ${req.auth.admin}: ${e}`);
		res.sendStatus(500);
	}
}

// method: POST
async function rootEditAdmin(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.body.id) {
			res.sendStatus(400);
			return;
		}
		res.startTime("dbQuery", "Database query");
		const doc = await Admin.findById(req.body.id);
		res.endTime("dbQuery");
		res.startTime("proc", "Data processing");
		if (!doc) {
			res.sendStatus(404);
			return;
		}
		if (doc.isRoot) {
			res.sendStatus(403);
			rootLog.warn(`Admin ${req.auth.admin} attempted to edit root user ${doc.username}`);
			return;
		}
		if (req.body.username) {
			doc.username = req.body.username;
		}
		if (req.body.password) {
			doc.password = await hashPassword(req.body.password);
		}
		await doc.save();
		res.endTime("proc");
		rootLog.info(`Admin ${doc.username} edited by ${req.auth.admin}`);
		res.sendStatus(200);
	} catch (e) {
		rootLog.error(`Error in POST: /root/editAdmin by ${req.auth.admin}: ${e}`);
		res.sendStatus(500);
	}
}

// method: DELETE
async function rootDeleteAdmin(req: AuthenticatedRequest, res: Response) {
	try  {
		if (!req.body.id) {
			res.sendStatus(400);
			return;
		}
		res.startTime("dbQuery", "Database query");
		const doc = await Admin.findById(req.body.id);
		res.endTime("dbQuery");
		res.startTime("proc", "Data processing");
		if (!doc) {
			res.sendStatus(404);
			return;
		}
		if (doc.isRoot) {
			res.sendStatus(403);
			rootLog.warn(`Admin ${req.auth.admin} attempted to delete root user ${doc.username}`);
			return;
		}
		await doc.deleteOne();
		res.endTime("proc");
		rootLog.info(`Admin ${doc.username} deleted by ${req.auth.admin}`);
		res.sendStatus(200);
	} catch (e) {
		rootLog.error(`Error in DELETE: /root/deleteAdmin by ${req.auth.admin}: ${e}`);
		res.sendStatus(500);
	}
}

export default {
	rootDuplicatePoll,
	rootGetAdmins,
	rootCreateAdmin,
	rootEditAdmin,
	rootDeleteAdmin
};
