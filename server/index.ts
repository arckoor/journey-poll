import "./src/utils/dotenv.helper.js";
import { logInit } from "./src/utils/log.helper.js";
logInit();

import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import serverTiming from "server-timing";
import pollRouter from "./src/routes/poll.route.js";

const PORT = 8080;
const app = express();
app.disable("x-powered-by"); // block header from containing information about the server
app.listen(PORT, () => console.log(`Backend started at http://localhost:${PORT}`));

app.use(express.json());
app.use(cookieParser());
app.use(cors({
	origin: true,
	credentials: true
}));
app.use(serverTiming({
	total: true,
	enabled: () => parseInt(process.env.sendTimingInfo) ? true : false
}));

app.use("/", pollRouter);

if (!process.env.dev) {
	app.use((_, res, next) => {
		res.header("Access-Control-Allow-Origin", "https://*.arckoor.dev");
		res.header("Access-Control-Max-Age", "86400");
		next();
	});
}
