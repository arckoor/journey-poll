import express from "express";
import multer from "multer";

import userController from "../controllers/poll.user.controller.js";
import adminController from "../controllers/poll.admin.controller.js";
import rootController from "../controllers/poll.root.controller.js";
import { authenticate } from "../middlewares/authenticate.poll.js";
import { trace } from "../middlewares/trace.poll.js";
import { imagePath, allowedImages, fileNameLength } from "../configs/poll.config.js";
import { connect } from "../utils/mongo.connector.js";
import { logoutScheduler, pollScheduler } from "../utils/cron.scheduler.js";
import { hashPassword, uniqueId } from "../utils/security.helper.js";
import path from "path";

await connect();
logoutScheduler();
pollScheduler();


const router = express.Router();
router.use("/", express.urlencoded({ extended: true }));
router.use("/images", express.static(imagePath));
router.use("/admin", authenticate);

for (const route of ["/poll", "/submit", "/results"]) {
	router.use(route, trace);
}

const storage = multer.diskStorage({
	// req file cb
	destination: (_, __, cb) => {
		cb(null, imagePath);
	},
	filename: async (_, file, cb) => {
		const ext = path.extname(file.originalname);
		cb(null, await uniqueId(fileNameLength, "alphanumeric", "filename", ext));
	},
});

const upload = multer({
	storage: storage,
	fileFilter: (_, file, cb) => {
		const ext = path.extname(file.originalname);
		if (allowedImages.includes(ext)) {
			return cb(null, true);
		}
		return cb(new Error(`${ext} is not a supported extension`));
	}
});

router.get    ("/poll/:id",                                           userController.getPoll);
router.post   ("/submit/:id",                                         userController.submitVotes);
router.get    ("/results/:id",                                        userController.getResults);
router.get    ("/winner/:id",                                         userController.getWinner);

router.post   ("/login",                                              adminController.login);
router.post   ("/admin/logout",                                       adminController.adminLogout);
router.post   ("/admin/auth",                                         adminController.adminAuth);
router.post   ("/admin/create",               upload.array("images"), adminController.adminCreatePoll);
router.get    ("/admin/poll/:id",                                     adminController.adminGetPoll);
router.post   ("/admin/edit/:id",             upload.array("images"), adminController.adminEditPoll);
router.delete ("/admin/delete/:id",                                   adminController.adminDeletePoll);
router.get    ("/admin/polls",                                        adminController.adminGetPolls);
router.get    ("/admin/results/:id",                                  adminController.adminGetResults);
router.post   ("/admin/publishResults/:id",                           adminController.adminPublishResults);
router.post   ("/admin/unpublishResults/:id",                         adminController.adminUnpublishResults);
router.post   ("/admin/createTiebreaker/:id",                         adminController.adminGenerateTiebreakerPoll);
router.get    ("/admin/settings",                                     adminController.adminGetSettings);
router.post   ("/admin/settings",                                     adminController.adminSetSettings);

router.post   ("/admin/root/duplicate/:id",                           rootController.rootDuplicatePoll);
router.get    ("/admin/root/getAdmins",                               rootController.rootGetAdmins);
router.post   ("/admin/root/createAdmin",                             rootController.rootCreateAdmin);
router.post   ("/admin/root/editAdmin",                               rootController.rootEditAdmin);
router.delete ("/admin/root/deleteAdmin",                             rootController.rootDeleteAdmin);

export default router;
