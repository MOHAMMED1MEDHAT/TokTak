import { Module } from '@nestjs/common';

import { RedisModule } from '@nestjs-modules/ioredis';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigsModule } from './configs/config.module';
import { typeOrmConfig } from './configs/typeorm.config';
import { MailModule } from './libs/mail/mail.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';

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
