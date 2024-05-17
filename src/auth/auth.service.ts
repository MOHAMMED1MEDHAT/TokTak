import { InjectRedis } from '@nestjs-modules/ioredis';
import {
	ConflictException,
	HttpException,
	HttpStatus,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotAcceptableException,
} from '@nestjs/common';
import { Redis } from 'ioredis';
import { UserEntity } from '../user/schemas';
import { EmailType } from './../mail/enums';
import { MailService } from './../mail/mail.service';
import { EmaiLDto } from './../user/dtos';
import { UserRepository } from './../user/repositories';
import {
	AuthLoginCredentialsDto,
	AuthSignupCredentialsDto,
	PasswordResetDto,
	VerificationAuthCodeDto,
} from './dtos';
import { AuthSessionAttribute } from './enums';
import { TokenType } from './enums/tokenType.enum';
import {
	JwtPayload,
	LoginResponse,
	MessageResponse,
	OauthScopeData,
	RefreshTokenResponse,
	VerificationTokenResponse,
} from './interfaces';
import { AuthRepository, AuthSessionRepository } from './repositories';

@Injectable()
export class AuthService {
	private logger = new Logger('AuthService');
	constructor(
		@InjectRedis() private readonly redis: Redis,
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
		const mailVerificationCode = await this.userRepository.generateEmailCode(user.id);
		await this.mailService.sendMail(user, EmailType.USER_CONFIRMATION, mailVerificationCode);

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

		// const mailVerificationCode = await this.userRepository.generateEmailCode(user.id);
		// await this.mailService.sendMail(user, EmailType.USER_CONFIRMATION, mailVerificationCode);

		return {
			message: `Please verify your email, We sent you a verification code in your mail: ${user.email}`,
		};
	}

	async externalAuthentication(
		data: OauthScopeData,
	): Promise<LoginResponse | MessageResponse | void> {
		const user = await this.userRepository.getUserByEmail(data.email);

		//if user does not exist, create a new user
		if (!user) {
			const newUser = new UserEntity();
			newUser.email = data.email;
			newUser.firstName = data.firstName;
			newUser.lastName = data.lastName;
			newUser.photo = data.picture;

			await this.userRepository.createNewUser(newUser);

			const mailVerificationCode = await this.userRepository.generateEmailCode(newUser.id);
			await this.mailService.sendMail(newUser, EmailType.USER_CONFIRMATION, mailVerificationCode);

			return {
				message: `Please verify your email, We sent you a verification code in your mail: ${user.email}`,
			};
		}

		//if user exists, create an authSession for user

		//1) create an authSession for user
		const session = await this.authSessionRepository.createSession(user.id);
		//2) create authentication tokens for user
		const accessToken = await this.authRepository.generateToken(
			user.id,
			TokenType.ACCESS_TOKEN,
			session.id,
		);
		const refreshToken = await this.authRepository.generateToken(
			user.id,
			TokenType.REFRESH_TOKEN,
			session.id,
		);
		//3) add the refreshToken to the authSession
		await this.authSessionRepository.addAttribute(
			session.id,
			AuthSessionAttribute.REFRESH_TOKEN,
			refreshToken,
		);

		delete user.passwordHash;

		return {
			user,
			accessToken,
			refreshToken,
		};
	}

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
			TokenType.ACCESS_TOKEN,
			session.id,
		);
		const refreshToken = await this.authRepository.generateToken(
			user.id,
			TokenType.REFRESH_TOKEN,
			session.id,
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
			TokenType.ACCESS_TOKEN,
			(
				await this.authSessionRepository.findOneBy({
					id: refreshTokenPayload.authSessionId,
				})
			).id,
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

	async verifyUserEmail(verificationCodeDto: VerificationAuthCodeDto): Promise<MessageResponse> {
		const { code, email } = verificationCodeDto;
		const userId = (await this.userRepository.getUserByEmail(email)).id;
		const user = await this.userRepository.verifyEmailCode(code, userId);
		if (!user) {
			throw new HttpException('Invalid verification code', HttpStatus.NOT_ACCEPTABLE);
		}
		return { message: 'Email verified successfully' };
	}

	async forgotPassword(emailDto: EmaiLDto): Promise<MessageResponse> {
		const { email } = emailDto;
		const code = await this.authRepository.generateResetPasswordCode(email);

		const user = await this.userRepository.getUserByEmail(email);

		await this.mailService.sendMail(user, EmailType.RESET_PASSWORD, code);

		return { message: `Password reset link sent to your email: ${email}` };
	}

	async verifyResetCode(
		verificationAuthCodeDto: VerificationAuthCodeDto,
	): Promise<VerificationTokenResponse> {
		const { code, email } = verificationAuthCodeDto;
		const user = await this.userRepository.getUserByEmail(email);
		const result = await this.authRepository.verifyResetPasswordCode(code, user.id);

		if (!result) {
			throw new NotAcceptableException('Invalid Reset code');
		}

		const token = await this.authRepository.generateToken(user.id, TokenType.PASSWORD_RESET_TOKEN);

		return { message: 'Code verified successfully', token };
	}

	async resetPassword(passwordResetDto: PasswordResetDto): Promise<MessageResponse> {
		const { token, password, confirmPassword } = passwordResetDto;

		if (password !== confirmPassword) {
			throw new NotAcceptableException('Passwords do not match');
		}

		const user = await this.userRepository.getUserByEmail(
			(await this.authRepository.getPayload(token)).email,
		);

		const result = await this.authRepository.changePassword(user, password);

		if (!result) {
			throw new InternalServerErrorException('Failed to reset password');
		}

		await this.mailService.sendMail(user, EmailType.PASSWORD_CHANGED);

		return { message: 'Password reset successfully' };
	}
}
