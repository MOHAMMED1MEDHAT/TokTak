import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-facebook';
import { OauthScopeData } from '../interfaces';

@Injectable()
export class FacebookStrategy extends PassportStrategy(Strategy, 'facebook') {
	constructor() {
		super({
			clientID: process.env.FACEBOOK_CLIENT_ID,
			clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
			callbackURL: process.env.SERVER_URL + process.env.FACEBOOK_CALLBACK_URL,
			scope: 'email',
			profileFields: ['emails', 'name', 'photos'],
		});
	}

	async validate(
		_accessToken: string,
		_refreshToken: string,
		profile: any,
		done: (err: any, user: any, info?: any) => void,
	): Promise<any> {
		console.log('profile', profile);
		const { id, name, emails, photos } = profile;

		const scope: OauthScopeData = {
			provider: 'facebook',
			providerId: id,
			// email: emails[0].value,
			email: 'facebook-null',
			firstName: name.givenName,
			lastName: name.familyName,
			picture: photos[0].value,
		};

		const data = { scope, payload: { from: 'facebook' } };

		done(null, data);
	}
}
