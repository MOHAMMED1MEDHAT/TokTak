import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserEntity } from 'src/user/entities/user.entity';
import { AuthRepository } from '../repositories/auth.repository';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
	Strategy,
	'jwt-refresh',
) {
	constructor(
		private readonly configService: ConfigService,
		private authRepository: AuthRepository,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromHeader('refreshToken'),
			ignoreExpiration: false,
			secretOrKey: `${process.env.JWT_REFRESH_SECRET}`,
		});
	}

	async validate(payload: { sub: string; email: string }): Promise<UserEntity> {
		const user = await this.authRepository.findOne({
			where: {
				email: payload.email,
			},
		});

		if (!user) {
			return null;
		}

		delete user.password;

		return user;
	}
}
