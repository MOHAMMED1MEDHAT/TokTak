export interface JwtPayload {
	email: string;
	sub: string;
	iat: number;
	isAdmin: boolean;
	authSessionId: string;
}
