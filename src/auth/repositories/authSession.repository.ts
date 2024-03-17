import {
	Injectable,
	InternalServerErrorException,
	Logger,
} from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AuthSessionEntity } from '../entities/authSession.entity';
import { AuthSessionStatus } from '../enums/authSessionType.enum';

@Injectable()
export class AuthSessionRepository extends Repository<AuthSessionEntity> {
	private logger = new Logger('AuthSessionRepository');
	constructor(private dataSource: DataSource) {
		super(AuthSessionEntity, dataSource.createEntityManager());
		this.dataSource = dataSource;
	}

	async invalidateSession(userId: string): Promise<void> {
		const session = await this.findOne({ where: { userId } });
		if (!session) {
			this.logger.error('the user dose not have an auth session');
			throw new InternalServerErrorException();
		}
		session.status = AuthSessionStatus.EXPIRED;
		try {
			await session.save();
		} catch (error) {
			this.logger.error(`invalidateSession error:${error}`);
			throw new InternalServerErrorException();
		}
	}
}
