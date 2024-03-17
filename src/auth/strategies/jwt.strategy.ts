import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserEntity } from 'src/user/entities';
import { JwtPayload } from '../interfaces/jwtPayload.interface';
import { AuthRepository } from '../repositories/auth.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		private readonly configService: ConfigService,
		private authRepository: AuthRepository,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: `${process.env.JWT_ACCESS_SECRET}`,
		});
	}

	async validate(
		payload: JwtPayload,
	): Promise<{ user: UserEntity; isAdmin: boolean; authSessionId: string }> {
		const { email, authSessionId, isAdmin } = payload;
		const user = await this.authRepository.findOne({
			where: {
				email,
			},
		});

		if (!user) {
			return null;
		}

		delete user.password;

		return {
			user,
			isAdmin,
			authSessionId,
		};
	}
}
