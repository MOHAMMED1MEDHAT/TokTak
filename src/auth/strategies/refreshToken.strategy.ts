import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from '../interfaces';
import { AuthRepository } from '../repositories';
import { UserEntity } from './../../user/entities';

@Injectable()
export class RefreshJwtStrategy extends PassportStrategy(
	Strategy,
	'jwt-refresh',
) {
	constructor(private authRepository: AuthRepository) {
		super({
			jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
			ignoreExpiration: false,
			secretOrKey: `${process.env.JWT_REFRESH_SECRET}`,
		});
	}

	async validate(
		payload: JwtPayload,
	): Promise<{ user: UserEntity; payload: JwtPayload }> {
		const { email } = payload;
		const user = await this.authRepository.findOne({
			where: {
				email,
			},
		});

		if (!user) {
			return null;
		}

		delete user.password;

		const data = {
			user,
			payload: payload,
		};

		return data;
	}
}
