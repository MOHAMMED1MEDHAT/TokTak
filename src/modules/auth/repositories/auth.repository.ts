import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../../user/schemas/user.entity';
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

	async generateToken(userId: string, tokenType: TokenType, sessionId?: string): Promise<string> {
		const user = await this.findOne({ where: { id: userId } });

		const payload: JwtPayload = {
			email: user.email,
			sub: { id: user.id },
			isAdmin: user.isAdmin,
			authSessionId: sessionId || null,
		};

		switch (tokenType) {
			case TokenType.PASSWORD_RESET_TOKEN: {
				return this.jwtService.sign(payload, {
					expiresIn: process.env.JWT_PASSWORD_RESET_EXPIRES_IN,
					secret: process.env.JWT_PASSWORD_RESET_SECRET,
				});
			}

			case TokenType.ACCESS_TOKEN: {
				return this.jwtService.sign(payload, {
					expiresIn: process.env.JWT_ACCESS_EXPIRES_IN,
					secret: process.env.JWT_ACCESS_SECRET,
				});
			}

			case TokenType.REFRESH_TOKEN: {
				return this.jwtService.sign(payload, {
					expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
					secret: process.env.JWT_REFRESH_SECRET,
				});
			}
		}
	}

	async getPayload(token: string): Promise<JwtPayload> {
		const valid = await this.jwtService.verify(token, {
			secret: process.env.JWT_PASSWORD_RESET_SECRET,
		});

		if (!valid) {
			throw new Error('Invalid token');
		}

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

	async generateResetPasswordCode(email: string): Promise<string> {
		this.logger.log('generateResetPasswordCode');
		const code = Math.random().toString(36).substring(2, 8).toUpperCase();
		const codeExpiry = Date.now() + parseInt(process.env.PASSWORD_RESET_EXPIRY_IN_MIN) * 60 * 1000;

		const user = await this.findOneBy({ email });
		user.passwordResetCode = code;
		user.passwordResetCodeExpires = new Date(codeExpiry);
		this.logger.verbose(
			`code: ${code}, expires: ${user.passwordResetCodeExpires},now: ${new Date(Date.now())}`,
		);

		return code;
	}

	async verifyResetPasswordCode(code: string, userId: string): Promise<UserEntity> {
		this.logger.log('verifyUser');
		const user = await this.findOneBy({ id: userId, emailConfirmationCode: code });

		const now = new Date();

		if (user && user.passwordResetCodeExpires > now) {
			user.passwordResetCode = null;
			user.passwordResetCodeExpires = null;
			await this.save(user);
			return user;
		}

		return null;
	}

	async changePassword(user: UserEntity, newPassword: string): Promise<UserEntity> {
		this.logger.log('changePassword');
		user.passwordHash = await this.hashPassword(newPassword);
		return await this.save(user);
	}
}
