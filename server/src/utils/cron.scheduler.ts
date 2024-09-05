import cron from "node-cron";

import { deletePoll } from "../controllers/poll.admin.controller.js";
import { Poll, Admin } from "../models/poll.model.js";
import { adminLog } from "./log.helper.js";

export const pollScheduler = () => cron.schedule(process.env.dev ? "*/1 * * * * * *" : "*/5 * * * *", async () => {
	const date = Date.now();
	for (const poll of await Poll.find({ })) {
		if (date > new Date(poll.expires).getTime()) {
			deletePoll(poll.id);
		}
	}
});

export const logoutScheduler = () => cron.schedule(process.env.dev ? "*/1 * * * * * *" : "*/5 * * * *", async () => {
	const date = Date.now();
	for (const admin of await Admin.find({ })) {
		if (admin.cookie !== "" && date > new Date(admin.lastRequest).getTime() + (60 * 60 * 1000)) { // 1 hour
			admin.cookie = "";
			await admin.save();
			adminLog.info(`Logged out admin ${admin.username} due to inactivity`);
		}
	}
});
