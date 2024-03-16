import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
	constructor() {}

	async signUp(username: string, pass: string): Promise<any> {}

	async login(username: string, pass: string): Promise<any> {}
}
