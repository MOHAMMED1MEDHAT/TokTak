import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
	constructor(
		private readonly configService: ConfigService,
		private prismaService: PrismaService,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: configService.get('JWT_ACCESS_SECRET'),
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
