import { Injectable, Logger } from '@nestjs/common';
import * as argon from 'argon2';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
	private logger = new Logger('UserRepository');
	constructor(private dataSource: DataSource) {
		super(UserEntity, dataSource.createEntityManager());
		this.dataSource = dataSource;
	}

	async signUp(
		firstName: string,
		lastName: string,
		password: string,
	): Promise<UserEntity> {
		this.logger.log('signUp');
		const user = new UserEntity();
		user.firstName = firstName;
		user.lastName = lastName;
		user.password = await this.hashPassword(password);

		try {
			await user.save();
		} catch (error) {
			this.logger.error(`Failed to save user: ${error}`);
		}

		return user;
	}

	async login(email: string, password: string): Promise<any> {
		this.logger.log('login');
	}

	async validateUser(username: string, pass: string): Promise<any> {
		this.logger.log('validateUser');
	}

	async hashPassword(password: string): Promise<string> {
		this.logger.log('hashPassword');
		return argon.hash(password);
	}

	async comparePassword(pass: string, hash: string): Promise<any> {
		this.logger.log('comparePassword');
	}
}
