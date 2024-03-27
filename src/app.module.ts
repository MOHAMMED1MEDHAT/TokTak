import { Module } from '@nestjs/common';

import { RedisModule } from '@nestjs-modules/ioredis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigsModule } from './config/config.module';
import { typeOrmConfig } from './config/typeorm.config';
import { MailModule } from './mail/mail.module';
import { UserModule } from './user/user.module';

@Module({
	imports: [
		TypeOrmModule.forRoot(typeOrmConfig),
		RedisModule.forRoot({
			type: 'single',
			url: process.env.REDIS_URL,
		}),
		AuthModule,
		UserModule,
		ConfigsModule,
		MailModule,
		RedisModule,
	],
})
export class AppModule {}
