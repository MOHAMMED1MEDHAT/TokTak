import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from '../mail/mail.service';
import { UserEntity } from '../user/entities';
import { UserRepository } from '../user/repositories';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository, AuthSessionRepository } from './repositories';
import { FacebookStrategy, GoogleStrategy, JwtStrategy, RefreshJwtStrategy } from './strategies';

@Module({
	imports: [
		TypeOrmModule.forFeature([UserEntity]),
		JwtModule.register({
			secret: process.env.JWT_ACCESS_SECRET,
			signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN },
		}),
	],
	controllers: [AuthController],
	providers: [
		AuthRepository,
		AuthSessionRepository,
		UserRepository,
		AuthService,
		JwtStrategy,
		RefreshJwtStrategy,
		GoogleStrategy,
		FacebookStrategy,
		MailService,
	],
	exports: [JwtStrategy, RefreshJwtStrategy, GoogleStrategy, FacebookStrategy],
})
export class AuthModule {}
