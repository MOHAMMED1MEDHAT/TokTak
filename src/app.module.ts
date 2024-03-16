import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigsModule } from './config/config.module';
import { typeOrmConfig } from './config/typeorm.config';
import { UserModule } from './user/user.module';

@Module({
	imports: [
		AuthModule,
		UserModule,
		ConfigsModule,
		TypeOrmModule.forRoot(typeOrmConfig),
	],
})
export class AppModule {}
