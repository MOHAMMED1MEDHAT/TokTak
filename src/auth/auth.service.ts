import { Injectable, Logger } from '@nestjs/common';
import { UserEntity } from '../user/entities/user.entity';
import { AuthLoginCredentialsDto, AuthSignupCredentialsDto } from './dtos';
import { TokenType } from './enums/tokenType.enum';
import { JwtPayload, LoginResponse, MessageResponse } from './interfaces';
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
		const refreshToken = (
			await this.authSessionRepository.findOneBy({ userId })
		).refreshToken;

		const refreshTokenPayload =
			await this.authRepository.getPayload(refreshToken);

		this.logger.verbose(
			`AuthService refreshTokenPayload ${refreshTokenPayload}`,
		);

		const accessToken = await this.authRepository.generateToken(
			userId,
			(
				await this.authSessionRepository.findOneBy({
					id: refreshTokenPayload.authSessionId,
				})
			).id,
			TokenType.ACCESS_TOKEN,
		);

		return {
			accessToken,
			refreshToken,
		};
	}

	async logout(
		user: UserEntity,
		payload: JwtPayload,
	): Promise<MessageResponse> {
		this.authRepository.logout(user, payload);
		return { message: 'User has been logged out' };
	}
}
