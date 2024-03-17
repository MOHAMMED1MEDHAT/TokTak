import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository, AuthSessionRepository } from './repositories';
import { JwtStrategy } from './strategies';

@Module({
	imports: [
		TypeOrmModule.forFeature([UserEntity]),
		PassportModule.register({ defaultStrategy: 'jwt' }),
		JwtModule.register({
			secret: process.env.JWT_SECRET,
			signOptions: {
				expiresIn: process.env.JWT_EXPIRES_IN,
			},
		}),
	],
	controllers: [AuthController],
	providers: [AuthRepository, AuthSessionRepository, AuthService, JwtStrategy],
	exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
