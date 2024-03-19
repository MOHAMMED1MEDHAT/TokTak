import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
	private logger = new Logger('UserRepository');
	constructor(private dataSource: DataSource) {
		super(UserEntity, dataSource.createEntityManager());
		this.dataSource = dataSource;
	}

	async getUserById(userId: string): Promise<UserEntity> {
		this.logger.log('getUserById');
		const user = await this.findOneBy({ id: userId });

		if (!user) {
			this.logger.error(`User with id: ${userId} not found`);
			throw new NotFoundException(`User with id: ${userId} not found`);
		}

		return user;
	}

	async getUserByEmail(email: string): Promise<UserEntity> {
		this.logger.log('getUserByEmail');
		const user = await this.findOneBy({ email });

		if (!user) {
			this.logger.error(`User with email: ${email} not found`);
			throw new NotFoundException(`User with email: ${email} not found`);
		}

		return user;
	}

	async createNewUser(user: UserEntity): Promise<UserEntity> {
		this.logger.log('createNewUser');
		return await this.save(user);
	}

	async updateEmail(email: string, userId: string): Promise<UserEntity> {
		this.logger.log('updateEmail');
		const user = await this.getUserById(userId);

		user.email = email;

		return await this.save(user);
	}

	async updateProfileImage(userId: string, profileImage: string): Promise<void> {
		this.logger.verbose(
			`Updating profile image for user with id: ${userId}, image: ${profileImage}`,
		);
	}

	async generateEmailCode(userId: string): Promise<string> {
		this.logger.log('generateEmailConfirmationCode');
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

	async verifyEmailCode(code: string, userId: string): Promise<UserEntity> {
		this.logger.log('verifyUser');
		const user = await this.findOneBy({ id: userId, emailConfirmationCode: code });
		const now = new Date();
		if (user && user.emailConfirmationCodeExpires > now) {
			user.isEmailConfirmed = true;
			user.emailConfirmationCode = null;
			user.emailConfirmationCodeExpires = null;
			await this.save(user);
			return user;
		}
	}
}
