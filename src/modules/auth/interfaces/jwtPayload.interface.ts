export interface JwtPayload {
	email: string;
	sub: {
		id: string;
	};
	isAdmin: boolean;
	authSessionId: string;
}
