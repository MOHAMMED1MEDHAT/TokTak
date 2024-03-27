import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';
import { TokenType } from 'src/auth/enums/tokenType.enum';

@Injectable()
export class RedisService {
	constructor(@InjectRedis() private readonly redis: Redis) {}

	async set(key: string, value: string): Promise<void> {
		const val = await this.redis.set(key, value);
		if (!val) {
			throw new Error('Failed to set value in redis');
		}
	}

	async setWithExpiration(key: string, value: string, expiration: number): Promise<void> {
		const val = await this.redis.set(key, value, 'EX', expiration);
		if (!val) {
			throw new Error('Failed to set value in redis');
		}
	}

	async del(key: string): Promise<void> {
		const val = await this.redis.del(key);
		if (!val) {
			throw new Error('Failed to delete value in redis');
		}
	}

	async get(key: string): Promise<string> {
		return this.redis.get(key);
	}

	async exists(key: string): Promise<boolean> {
		const val = await this.redis.exists(key);
		return val === 1;
	}

	async storeToken(type: TokenType, token: string): Promise<void> {
		const key = `${this.getKeyPrefix(type)}:${token}`;
		await this.setWithExpiration(key, token, this.getKeyExpiration(type));
	}

	async deleteToken(token: string): Promise<void> {
		const key = `${process.env.REDIS_AUTH_KEY}:${token}`;
		await this.del(key);
	}

	private getKeyPrefix(type: TokenType): string {
		switch (type) {
			case TokenType.ACCESS_TOKEN:
				return process.env.REDIS_ACCESS_KEY;
			case TokenType.REFRESH_TOKEN:
				return process.env.REDIS_REFRESH_KEY;
			case TokenType.PASSWORD_RESET_TOKEN:
				return process.env.REDIS_PASSWORD_RESET_KEY;
			case TokenType.TWITTER_TOKEN:
				return process.env.REDIS_TWITTER_KEY;
		}
	}

	private getKeyExpiration(type: TokenType): number {
		switch (type) {
			case TokenType.ACCESS_TOKEN:
				return Number(process.env.REDIS_ACCESS_EXPIRATION);
			case TokenType.REFRESH_TOKEN:
				return Number(process.env.REDIS_REFRESH_EXPIRATION);
			case TokenType.PASSWORD_RESET_TOKEN:
				return Number(process.env.REDIS_PASSWORD_RESET_EXPIRATION);
			case TokenType.TWITTER_TOKEN:
				return Number(process.env.REDIS_TWITTER_EXPIRATION);
		}
	}
}
