import { Schema, model } from "mongoose";
import { IPoll, IUser, IAdmin } from "../interfaces/poll.interface.js";

const pollSchema = new Schema<IPoll>({
	id: String,
	createdBy: String,
	name: String,
	info: String,
	images: [String],
	originalNames: {
		type: Map,
		of: String
	},
	aspectRatios: {
		type: Map,
		of: String
	},
	votes: {
		type: Map,
		of: Number
	},
	allowedVotes: Number,
	voteAmount: Number,
	public: Boolean,
	ends: Date,
	expires: Date
});

const userSchema = new Schema<IUser>({
	ip: String,
	cookie: String,
	votes: {
		type: Map,
		of: [String]
	}
});

const adminSchema = new Schema<IAdmin>({
	username: String,
	password: String,
	cookie: String,
	lastRequest: Date,
	isRoot: Boolean,
	settings: {
		type: Map,
		of: String
	}
});

export const Poll = model<IPoll>("Poll", pollSchema);
export const User = model<IUser>("User", userSchema);
export const Admin = model<IAdmin>("Admin", adminSchema);
