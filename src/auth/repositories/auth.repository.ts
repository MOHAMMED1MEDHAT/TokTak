import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../../user/entities/user.entity';
import { TokenType } from '../enums/tokenType.enum';
import { JwtPayload } from '../interfaces/jwtPayload.interface';

@Injectable()
export class AuthRepository extends Repository<UserEntity> {
	private logger = new Logger('AuthRepository');
	constructor(
		private dataSource: DataSource,
		private jwtService: JwtService,
	) {
		super(UserEntity, dataSource.createEntityManager());
		this.dataSource = dataSource;
	}

	async validateUser(email: string, pass: string): Promise<UserEntity> {
		this.logger.log('validateUser');
		const user = await this.findOneBy({ email });
		if (user && (await this.comparePassword(pass, user.passwordHash))) {
			return user;
		}

		return null;
	}

	async generateToken(userId: string, sessionId: string, tokenType: TokenType): Promise<string> {
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

	async generateEmailConfirmationCode(userId: string): Promise<string> {
		this.logger.log('generateCode');
		const code = Math.random().toString(36).substring(2, 8).toUpperCase();
		const codeExpiry =
			Date.now() + parseInt(process.env.EMAIL_CONFIRMATION_EXPIRY_IN_MIN) * 60 * 1000;

		const user = await this.findOneBy({ id: userId });
		user.emailConfirmationCode = code;
		user.emailConfirmationCodeExpires = new Date(codeExpiry);
		this.logger.verbose(
			`code: ${code}, expires: ${user.emailConfirmationCodeExpires},now: ${new Date(Date.now())}`,
		);

		await this.save(user);
		return code;
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

	async verifyUser(code: string): Promise<UserEntity> {
		this.logger.log('verifyUser');
		const user = await this.findOneBy({ emailConfirmationCode: code });
		const now = new Date();
		if (user && user.emailConfirmationCodeExpires > now) {
			user.isEmailConfirmed = true;
			user.emailConfirmationCode = null;
			user.emailConfirmationCodeExpires = null;
			await this.save(user);
			return user;
		}
	}

	//TODO: implement the following method
	// async resetPassword(email: string, code: string, newPassword: string): Promise<UserEntity> {}

	//TODO: implement the following method
	// async changePassword(user: UserEntity, newPassword: string): Promise<UserEntity> {}
}
