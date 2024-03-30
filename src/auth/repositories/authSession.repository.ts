import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { AuthSessionEntity } from '../entities';
import { AuthSessionAttribute, AuthSessionStatus } from '../enums';
import { UserEntity } from './../../user/entities';

@Injectable()
export class AuthSessionRepository extends Repository<AuthSessionEntity> {
	private logger = new Logger('AuthSessionRepository');
	constructor(private dataSource: DataSource) {
		super(AuthSessionEntity, dataSource.createEntityManager());
		this.dataSource = dataSource;
	}

	async createSession(userId: string): Promise<AuthSessionEntity> {
		this.logger.log('createSession');

		const session = new AuthSessionEntity();
		session.userId = userId;
		session.status = AuthSessionStatus.VALID;

		try {
			await session.save();
		} catch (error) {
			this.logger.error(`createSession error:${error}`);
			throw new InternalServerErrorException();
		}

		return session;
	}

	async addAttribute(
		sessionId: string,
		attributeType: AuthSessionAttribute,
		attributeValue: string,
	): Promise<AuthSessionEntity> {
		this.logger.log('addAttribute', attributeType);

		const session = await this.findOneBy({ id: sessionId });
		switch (attributeType) {
			case AuthSessionAttribute.REFRESH_TOKEN:
				session.refreshToken = attributeValue;
				break;
			case AuthSessionAttribute.CHAT_SOCKET:
				session.chatSocket = attributeValue;
				break;
			case AuthSessionAttribute.NOTIFICATIONS_SOCKET:
				session.notificationsSocket = attributeValue;
				break;
			case AuthSessionAttribute.RTC_SOCKET:
				session.rtcSocket = attributeValue;
				break;
		}

		try {
			await session.save();
		} catch (error) {
			this.logger.error(`addAttribute error:${error}`);
			throw new InternalServerErrorException();
		}

		return session;
	}

	async removeAttribute(
		sessionId: string,
		attributeType: AuthSessionAttribute,
	): Promise<AuthSessionEntity> {
		this.logger.log('removeAttribute', attributeType);

		const session = await this.findOneBy({ id: sessionId });
		switch (attributeType) {
			case AuthSessionAttribute.REFRESH_TOKEN:
				session.refreshToken = null;
				break;
			case AuthSessionAttribute.CHAT_SOCKET:
				session.chatSocket = null;
				break;
			case AuthSessionAttribute.NOTIFICATIONS_SOCKET:
				session.notificationsSocket = null;
				break;
			case AuthSessionAttribute.RTC_SOCKET:
				session.rtcSocket = null;
				break;
		}

		try {
			await session.save();
		} catch (error) {
			this.logger.error(`addAttribute error:${error}`);
			throw new InternalServerErrorException();
		}

		return session;
	}

	async invalidateSession(sessionId: string): Promise<void> {
		const session = await this.findOne({ where: { id: sessionId } });

		if (!session) {
			this.logger.error('the user dose not have any auth sessions');
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

	async invalidateAllUserSessions(user: UserEntity): Promise<void> {
		const sessions = await this.find({ where: { userId: user.id } });

		if (!sessions) {
			this.logger.error('the user dose not have any auth sessions');
			throw new InternalServerErrorException();
		}

		sessions.forEach(async (session) => {
			session.status = AuthSessionStatus.EXPIRED;
			try {
				await session.save();
			} catch (error) {
				this.logger.error(`invalidateSession error:${error}`);
				throw new InternalServerErrorException();
			}
		});
	}
}
