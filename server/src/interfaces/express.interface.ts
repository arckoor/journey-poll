import { Request } from "express";
import { Document } from "mongoose";

export interface AuthenticatedRequest extends Request {
	auth: {
		admin: string,
		id: Document["_id"]
		isRoot: boolean
	}
}

export interface UserRequest extends Request {
	auth: {
		id: Document["_id"]
	}
}
