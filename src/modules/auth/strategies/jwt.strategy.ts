import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserEntity } from '../../user/schemas';
import { JwtPayload } from '../interfaces';
import { AuthRepository } from '../repositories';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(private authRepository: AuthRepository) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: `${process.env.JWT_ACCESS_SECRET}`,
		});
	}

	async validate(payload: JwtPayload): Promise<{ user: UserEntity; payload: JwtPayload }> {
		const { email } = payload;
		const user = await this.authRepository.findOne({
			where: {
				email,
			},
		});

		if (!user) {
			return null;
		}

		delete user.passwordHash;

		const data = {
			user,
			payload: payload,
		};

		return data;
	}
}
