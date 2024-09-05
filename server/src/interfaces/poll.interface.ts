import { allowedSettings } from "../configs/poll.config.js";

export interface IPoll {
	id: string
	createdBy: string
	name: string
	info: string
	images: string[]
	originalNames: Map<string, string>
	votes: Map<string, number>
	aspectRatios: Map<string, string>
	allowedVotes: number
	voteAmount: number
	public: boolean
	ends: Date
	expires: Date
}

export interface IUser {
	ip: string
	cookie: string
	votes: Map<string, string[]>
}

export interface IAdmin {
	username: string
	password: string
	cookie: string
	lastRequest: Date
	isRoot: boolean,
	settings: Map<TSettings, string>
}

export type TSettings = typeof allowedSettings[number];
