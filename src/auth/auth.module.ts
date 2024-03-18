import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository, AuthSessionRepository } from './repositories';
import { JwtStrategy, RefreshJwtStrategy } from './strategies';

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
		AuthService,
		JwtStrategy,
		RefreshJwtStrategy,
	],
	exports: [JwtStrategy, RefreshJwtStrategy],
})
export class AuthModule {}
