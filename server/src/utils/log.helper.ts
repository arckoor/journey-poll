import log4js from "log4js";

export const logInit = () => log4js.configure({
	appenders: {
		out: {
			type: "stdout",
		},
		root: {
			type: "file",
			filename: "logs/root.log",
			layout: {
				type: "colored"
			}
		},
		admin: {
			type: "file",
			filename: "logs/admin.log",
			layout: {
				type: "colored"
			}
		},
		user: {
			type: "file",
			filename: "logs/user.log",
			layout: {
				type: "colored"
			}
		},
		dl: {
			type: "file",
			filename: "logs/dl.log",
			layout: {
				type: "colored"
			}
		}
	},
	categories: {
		default: {
			appenders: ["out"],
			level: "error"
		},
		root: {
			appenders: ["root"],
			level: "info"
		},
		admin: {
			appenders: ["admin"],
			level: "info"
		},
		user: {
			appenders: ["user"],
			level: "info"
		},
		dl: {
			appenders: ["dl"],
			level: "info"
		}
	}
});

export const log = log4js.getLogger("default");
export const rootLog = log4js.getLogger("root");
export const adminLog = log4js.getLogger("admin");
export const userLog = log4js.getLogger("user");
export const dlLog = log4js.getLogger("dl");
