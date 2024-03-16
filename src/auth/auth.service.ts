import { Injectable, Logger } from '@nestjs/common';
import { UserEntity } from './../user/user.entity';
import { AuthRepository } from './auth.repository';
import { AuthLoginCredentialsDto, AuthSignupCredentialsDto } from './dtos';
import { LoginResponse, MessageResponse } from './interfaces';

@Injectable()
export class AuthService {
	private logger = new Logger('AuthService');
	constructor(private authRepository: AuthRepository) {}

	async signUp(authDto: AuthSignupCredentialsDto): Promise<MessageResponse> {
		const user = await this.authRepository.signUp(authDto);
		return { message: `User ${user.email} has been created` };
	}

	async login(authDto: AuthLoginCredentialsDto): Promise<LoginResponse> {
		return await this.authRepository.login(authDto);
	}

	async logout(user: UserEntity): Promise<MessageResponse> {
		this.authRepository.logout(user);
		return { message: 'User has been logged out' };
	}
}
