import { Request, Response } from "express";
import { UserRequest } from "../interfaces/express.interface.js";
import { Poll, User } from "../models/poll.model.js";
import { userLog } from "../utils/log.helper.js";
import { imageWithExtension, trimExt } from "../utils/fs.helper.js";

// method: GET
async function getPoll(req: UserRequest, res: Response) {
	try {
		const id = req.params.id;
		const doc = await Poll.findOne({ id: id }).select({ name: true, info: true, images: true, ends: true, allowedVotes: true, aspectRatios: true });
		if (!doc) {
			return res.sendStatus(404);
		}
		res.startTime("dbQuery", "Database query");
		const userDoc = await User.findById(req.auth.id).select({ votes: true });
		res.endTime("dbQuery");
		const mappedVotes = userDoc.votes.get(id);
		const votes = mappedVotes ? mappedVotes : [];
		const ended = Date.now() > new Date(doc.ends).getTime();
		res.send(JSON.stringify({
			name: doc.name,
			info: doc.info,
			allowedVotes: doc.allowedVotes,
			images: doc.images,
			aspectRatios: doc.aspectRatios,
			ends: doc.ends,
			ended: ended,
			votes: votes
		}));
	} catch (e) {
		userLog.error(`Error in GET: /getPoll ${req.params.id}: ${e}`);
		res.sendStatus(500);
	}
}

// method: POST
async function submitVotes(req: UserRequest, res: Response) {
	try {
		const id = req.params.id;
		res.startTime("dbQuery", "Database query");
		const doc = await Poll.findOne({ id: id }).select({ ends: true, votes: true });
		res.endTime("dbQuery");
		if (!doc
			|| Date.now() > new Date(doc.ends).getTime()
			|| req.body.votes > doc.allowedVotes) {
			return res.sendStatus(400);
		}
		res.startTime("proc", "Data processing");
		const userDoc = await User.findById(req.auth.id).select({ votes: true });
		if (userDoc.votes.get(id)) {
			res.sendStatus(400);
			userLog.warn(`User ${req.auth.id} attempted to vote again for poll ${id}`);
			return;
		}
		userDoc.votes.set(id, req.body.votes);
		await userDoc.save();

		for (const vote of req.body.votes) {
			const voteIndex = trimExt(vote);
			const currentVotes = doc.votes.get(voteIndex);
			if (voteIndex && currentVotes !== undefined) {
				doc.votes.set(voteIndex, currentVotes+1);
			}
		}
		doc.$inc("voteAmount", 1);
		await doc.save();
		res.endTime("proc");
		res.sendStatus(200);
		userLog.info(`User ${req.auth.id} voted for poll ${id}: ${req.body.votes}`);
	} catch (e) {
		userLog.error(`Error in POST: /submitVotes ${req.params.id}: ${e}`);
		res.sendStatus(500);
	}
}

// method: GET
async function getResults(req: Request, res: Response) {
	try {
		res.startTime("dbQuery", "Database query");
		const doc = await Poll.findOne({ id: req.params.id }).select({ name: true, images: true, aspectRatios: true, voteAmount: true, votes: true, public: true, ends: true });
		res.endTime("dbQuery");
		if (!doc) {
			return res.sendStatus(404);
		}
		if (doc.public) {
			res.startTime("proc", "Data processing");
			if (Date.now() < new Date(doc.ends).getTime()) {
				return res.send(JSON.stringify({ ends: doc.ends }));
			}
			const first = [],
				second = [],
				third = [];
			const votes = Array.from(new Set(doc.votes.values())).sort((a, b) => b - a);
			for (let i = 0; i < Math.min(votes.length, 3); i++) {
				const vote = votes[i];
				const voteKeys = Array.from(doc.votes.keys())
					.filter(key => doc.votes.get(key) === vote)
					.map(key => imageWithExtension(doc.images, key));
				for (const key of voteKeys) {
					[first, second, third][i].push(key);
				}
			}
			const remaining = Array.from(doc.votes.keys())
				.filter(key => {
					const k = doc.votes.get(key);
					return k != votes[0] && k != votes[1] && k != votes[2];
				})
				.map(key => imageWithExtension(doc.images, key));
			const data = {
				name: doc.name,
				images: doc.images,
				aspectRatios: doc.aspectRatios,
				voteAmount: doc.voteAmount,
				public: doc.public,
				first: first,
				second: second,
				third: third,
				remaining: remaining
			};
			res.endTime("proc");
			return res.send(JSON.stringify(data));
		}
		res.send(JSON.stringify({ name: doc.name, public: doc.public }));
	} catch (e) {
		userLog.error(`Error in GET: /getResults ${req.params.id}: ${e}`);
		res.sendStatus(500);
	}
}

async function getWinner(req: Request, res: Response) {
	try {
		res.startTime("dbQuery", "Database query");
		const doc = await Poll.findOne({ id: req.params.id }).select({ images: true, originalNames: true, votes: true, public: true, ends: true });
		res.endTime("dbQuery");
		if (!doc) {
			return res.sendStatus(404);
		}
		if (doc.public) {
			res.startTime("proc", "Data processing");
			if (Date.now() < new Date(doc.ends).getTime()) {
				return res.send(JSON.stringify({ ends: doc.ends }));
			}
			let format = req.query.format;
			if (format) {
				if (!["internal", "original"].includes(format as string)) {
					return res.sendStatus(400);
				}
			} else {
				format = "internal";
			}
			const maxVote = Math.max(...doc.votes.values());
			const winner = Array.from(doc.votes.keys())
				.filter(key => doc.votes.get(key) === maxVote)
				.map(key => imageWithExtension(doc.images, key));
			for (let i=0; i<winner.length; i++) {
				winner[i] = format === "internal" ? winner[i] : doc.originalNames.get(trimExt(winner[i]));
			}
			res.endTime("proc");
			return res.send(JSON.stringify({
				winner: winner
			}));
		}
		res.send(JSON.stringify({ name: doc.name, public: doc.public }));
	} catch (e) {
		userLog.error(`Error in GET: /getWinner ${req.params.id}: ${e}`);
		res.sendStatus(500);
	}
}

export default {
	getPoll,
	submitVotes,
	getResults,
	getWinner
};
