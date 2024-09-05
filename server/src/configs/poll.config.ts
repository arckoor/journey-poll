const mongoAddress = process.env.mongoAddress;
const mongoDatabase = process.env.pollDbName;

export const mongoDB = "mongodb://" + mongoAddress + "/" + mongoDatabase;
export const imagePath = "./images/";

export const allowedImages = [
	".png",
	".jpg",
	".jpeg",
	".webp",
	".svg"
];

export const allowedSettings =  [
	"name",
	"info",
	"allowedVotes",
	"endTime",
	"endPlusDays",
	"expireTime",
	"expirePlusDays"
] as const;

export const fileNameLength = 15;
export const pollIdLength = 6;
export const bcryptSaltRounds = 12;
export const adminCookieLength = 64;
export const userCookieLength = 60;
