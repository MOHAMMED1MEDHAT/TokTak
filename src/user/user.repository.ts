import { Injectable, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { UserEntity } from './user.entity';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
	private logger = new Logger('UserRepository');
	constructor(private dataSource: DataSource) {
		super(UserEntity, dataSource.createEntityManager());
		this.dataSource = dataSource;
	}

	async updateProfileImage(
		userId: string,
		profileImage: string,
	): Promise<void> {
		this.logger.verbose(`Updating profile image for user with id: ${userId}`);
	}
}
