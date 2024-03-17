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
import { UserEntity } from './../user/user.entity';
import { AuthLoginCredentialsDto, AuthSignupCredentialsDto } from './dtos';
import { LoginResponse } from './interfaces';
import { JwtPayload } from './interfaces/jwtPayload.interface';

@Injectable()
export class AuthRepository extends Repository<UserEntity> {
	private logger = new Logger('UserRepository');
	constructor(
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
		const { email, password } = authLoginCredentials;
		const user = await this.validateUser(email, password);
		if (!user) {
			this.logger.error('Invalid credentials');
			throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
		}
		const payload: JwtPayload = {
			email: user.email,
			sub: { id: user.id },
			iat: new Date().getTime(),
			isAdmin: user.isAdmin,
		};

		this.logger.verbose(
			`Token info: ${process.env.JWT_ACCESS_EXPIRES_IN}, ${process.env.JWT_ACCESS_SECRET}`,
		);

		return {
			user,
			accessToken: this.jwtService.sign(payload, {
				expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
				secret: process.env.JWT_ACCESS_SECRET,
			}),
			refreshToken: this.jwtService.sign(payload, {
				expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
				secret: process.env.JWT_REFRESH_SECRET,
			}),
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

	async hashPassword(password: string): Promise<string> {
		this.logger.log('hashPassword');
		return argon.hash(password);
	}

	async comparePassword(pass: string, hash: string): Promise<boolean> {
		this.logger.log('comparePassword');
		return argon.verify(hash, pass);
	}

	async logout(user: UserEntity): Promise<void> {
		this.logger.log('logout');
		this.logger.log(`User ${user.email} has been logged out`);
	}
}
