import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRepository } from 'src/user/user.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		private readonly configService: ConfigService,
		private UserRepository: UserRepository,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: `${process.env.JWT_ACCESS_TOKEN_SECRET}`,
		});
	}

	async validate(payload: { sub: string; email: string }): Promise<User> {
		const user = await this.prismaService.user.findUnique({
			where: {
				email: payload.email,
			},
		});

		if (!user) {
			return null;
		}

		delete user.hash;

		return user;
	}
}
