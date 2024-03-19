import {
	ConflictException,
	HttpException,
	HttpStatus,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotAcceptableException,
} from '@nestjs/common';
import { EmailType } from 'src/mail/enums';
import { MailService } from 'src/mail/mail.service';
import { UserRepository } from 'src/user/repositories';
import { UserEntity } from '../user/entities/user.entity';
import { AuthLoginCredentialsDto, AuthSignupCredentialsDto, VerificationCodeDto } from './dtos';
import { AuthSessionAttribute } from './enums';
import { TokenType } from './enums/tokenType.enum';
import { JwtPayload, LoginResponse, MessageResponse, RefreshTokenResponse } from './interfaces';
import { AuthRepository, AuthSessionRepository } from './repositories';

@Injectable()
export class AuthService {
	private logger = new Logger('AuthService');
	constructor(
		private mailService: MailService,
		private authRepository: AuthRepository,
		private authSessionRepository: AuthSessionRepository,
		private userRepository: UserRepository,
	) {}

	async signUp(authSignupCredentialsDto: AuthSignupCredentialsDto): Promise<MessageResponse> {
		// this.logger.log('signUp');
		const { email, firstName, lastName, confirmPassword, password } = authSignupCredentialsDto;

		if (password !== confirmPassword) {
			// this.logger.error('Passwords do not match');
			throw new NotAcceptableException('Passwords do not match');
		}

		const user = new UserEntity();
		user.email = email;
		user.firstName = firstName;
		user.lastName = lastName;
		user.passwordHash = await this.authRepository.hashPassword(password);

		try {
			await this.userRepository.createNewUser(user);
		} catch (error) {
			this.logger.error(`Failed to save user: ${error}`);
			switch (error.name) {
				case 'QueryFailedError':
					throw new ConflictException('User already exists');
				default:
					throw new InternalServerErrorException('Failed to save user');
			}
		}

		const mailVerificationCode = await this.userRepository.generateEmailCode(user.id);
		await this.mailService.sendMail(user, EmailType.USER_CONFIRMATION, mailVerificationCode);

		return {
			message: `Please verify your email, We sent you a verification code in your mail: ${user.email}`,
		};
	}

	// async externalAuthentication(): Promise<LoginResponse | MessageResponse> {}

	async login(authDto: AuthLoginCredentialsDto): Promise<LoginResponse> {
		const { email, password } = authDto;
		//1) check if user exists
		const user = await this.authRepository.validateUser(email, password);

		if (!user) {
			this.logger.error('Invalid credentials');
			throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
		}
		//2) create an authSession for user
		const session = await this.authSessionRepository.createSession(user.id);
		//3) create authentication tokens for user
		const accessToken = await this.authRepository.generateToken(
			user.id,
			session.id,
			TokenType.ACCESS_TOKEN,
		);
		const refreshToken = await this.authRepository.generateToken(
			user.id,
			session.id,
			TokenType.REFRESH_TOKEN,
		);
		//4) add the refreshToken to the authSession
		await this.authSessionRepository.addAttribute(
			session.id,
			AuthSessionAttribute.REFRESH_TOKEN,
			refreshToken,
		);

		return {
			user,
			accessToken,
			refreshToken,
		};
	}

	async refresh(userId: string): Promise<RefreshTokenResponse> {
		const refreshToken = (await this.authSessionRepository.findOneBy({ userId })).refreshToken;

		const refreshTokenPayload = await this.authRepository.getPayload(refreshToken);

		this.logger.verbose(`refreshTokenPayload ${refreshTokenPayload}`);

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

	async logout(user: UserEntity, payload: JwtPayload): Promise<MessageResponse> {
		this.logger.log('logout');
		await this.authSessionRepository.invalidateSession(payload.authSessionId);
		this.logger.log(`User ${user.email} has been logged out`);

		return { message: 'User logged out successfully' };
	}

	async verifyUserEmail(verificationCodeDto: VerificationCodeDto): Promise<MessageResponse> {
		const { code, email } = verificationCodeDto;
		const userId = (await this.userRepository.getUserByEmail(email)).id;
		const user = await this.userRepository.verifyEmailCode(code, userId);
		if (!user) {
			throw new HttpException('Invalid verification code', HttpStatus.NOT_ACCEPTABLE);
		}
		return { message: 'Email verified successfully' };
	}
}
