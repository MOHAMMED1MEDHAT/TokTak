export interface JwtPayload {
	email: string;
	sub: {
		id: string;
	};
	iat: number;
	isAdmin: boolean;
}
