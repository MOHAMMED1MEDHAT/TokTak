import { Injectable, Logger } from '@nestjs/common';
import { UserEntity } from '../user/entities/user.entity';
import { AuthLoginCredentialsDto, AuthSignupCredentialsDto } from './dtos';
import { LoginResponse, MessageResponse } from './interfaces';
import { RefreshTokenResponse } from './interfaces/refreshTokenResponse.interface';
import { AuthRepository, AuthSessionRepository } from './repositories';

@Injectable()
export class AuthService {
	private logger = new Logger('AuthService');
	constructor(
		private authRepository: AuthRepository,
		private authSessionRepository: AuthSessionRepository,
	) {}

	async signUp(authDto: AuthSignupCredentialsDto): Promise<MessageResponse> {
		const user = await this.authRepository.signUp(authDto);
		return { message: `User ${user.email} has been created` };
	}

	async login(authDto: AuthLoginCredentialsDto): Promise<LoginResponse> {
		return await this.authRepository.login(authDto);
	}

	async refresh(userId: string): Promise<RefreshTokenResponse> {
		return {
			accessToken: await this.authRepository.generateAccessToken(userId),
			refreshToken: (await this.authSessionRepository.findOneBy({ userId }))
				.refreshToken,
		};
	}

	async logout(user: UserEntity): Promise<MessageResponse> {
		this.authRepository.logout(user);
		this.authSessionRepository.invalidateSession(user.id);
		return { message: 'User has been logged out' };
	}
}
