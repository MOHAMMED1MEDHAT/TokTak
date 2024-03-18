import {
	ConflictException,
	HttpException,
	HttpStatus,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotAcceptableException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { AuthLoginCredentialsDto, AuthSignupCredentialsDto } from '../dtos';
import { AuthSessionAttribute } from '../enums/authSessionAttribute.enum';
import { TokenType } from '../enums/tokenType.enum';
import { LoginResponse } from '../interfaces';
import { JwtPayload } from '../interfaces/jwtPayload.interface';
import { AuthSessionRepository } from './authSession.repository';

@Injectable()
export class AuthRepository extends Repository<UserEntity> {
	private logger = new Logger('AuthRepository');
	constructor(
		private authSessionRepository: AuthSessionRepository,
		private dataSource: DataSource,
		private jwtService: JwtService,
	) {
		super(UserEntity, dataSource.createEntityManager());
		this.dataSource = dataSource;
	}

	async signUp(
		authSignupCredentialsDto: AuthSignupCredentialsDto,
	): Promise<UserEntity> {
		this.logger.log('signUp');
		const { email, firstName, lastName, confirmPassword, password } =
			authSignupCredentialsDto;

		if (password !== confirmPassword) {
			// this.logger.error('Passwords do not match');
			throw new NotAcceptableException('Passwords do not match');
		}

		const user = new UserEntity();
		user.email = email;
		user.firstName = firstName;
		user.lastName = lastName;
		user.password = await this.hashPassword(password);

		try {
			await user.save();
		} catch (error) {
			this.logger.error(`Failed to save user: ${error}`);
			switch (error.name) {
				case 'QueryFailedError':
					throw new ConflictException('User already exists');
				default:
					throw new InternalServerErrorException('Failed to save user');
			}
		}

		return user;
	}

	//TODO: Implement the login method
	async login(
		authLoginCredentials: AuthLoginCredentialsDto,
	): Promise<LoginResponse> {
		this.logger.log('login');
		this.logger.verbose(
			`Token info: ${process.env.JWT_ACCESS_EXPIRES_IN}, ${process.env.JWT_ACCESS_SECRET}`,
		);

		const { email, password } = authLoginCredentials;
		//1) check if user exists
		const user = await this.validateUser(email, password);

		if (!user) {
			this.logger.error('Invalid credentials');
			throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
		}
		//2) create an authSession for user
		const session = await this.authSessionRepository.createSession(user.id);
		//3) create authentication tokens for user
		const accessToken = await this.generateToken(
			user.id,
			session.id,
			TokenType.ACCESS_TOKEN,
		);
		const refreshToken = await this.generateToken(
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

	async validateUser(email: string, pass: string): Promise<UserEntity> {
		this.logger.log('validateUser');
		const user = await this.findOneBy({ email });
		if (user && (await this.comparePassword(pass, user.password))) {
			return user;
		}

		return null;
	}

	async generateToken(
		userId: string,
		sessionId: string,
		tokenType: TokenType,
	): Promise<string> {
		this.logger.log('generateAccessToken');
		const user = await this.findOne({ where: { id: userId } });

		if (tokenType == TokenType.PASSWORD_RESET_TOKEN) {
			//TODO: handle reset password use case
		}

		const payload: JwtPayload = {
			email: user.email,
			sub: { id: user.id },
			isAdmin: user.isAdmin,
			authSessionId: sessionId,
		};

		return this.jwtService.sign(payload, {
			expiresIn:
				tokenType == TokenType.ACCESS_TOKEN
					? process.env.JWT_ACCESS_EXPIRES_IN
					: process.env.JWT_REFRESH_EXPIRES_IN,
			secret:
				tokenType == TokenType.ACCESS_TOKEN
					? process.env.JWT_ACCESS_SECRET
					: process.env.JWT_REFRESH_SECRET,
		});
	}

	async getPayload(token: string): Promise<JwtPayload> {
		return await this.jwtService.decode(token);
	}

	async hashPassword(password: string): Promise<string> {
		this.logger.log('hashPassword');
		return argon.hash(password);
	}

	async comparePassword(pass: string, hash: string): Promise<boolean> {
		this.logger.log('comparePassword');
		return argon.verify(hash, pass);
	}

	async logout(user: UserEntity, payload: JwtPayload): Promise<void> {
		this.logger.log('logout');
		await this.authSessionRepository.invalidateSession(payload.authSessionId);
		this.logger.log(`User ${user.email} has been logged out`);
	}
}
