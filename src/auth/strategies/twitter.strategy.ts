import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from '@superfaceai/passport-twitter-oauth2';
import { OauthScopeData } from '../interfaces';

@Injectable()
export class TwitterStrategy extends PassportStrategy(Strategy, 'twitter') {
	constructor() {
		super({
			clientID: process.env.TWITTER_CLIENT_ID,
			clientSecret: process.env.TWITTER_CLIENT_SECRET,
			callbackURL: process.env.SERVER_URL + process.env.TWITTER_CALLBACK_URL,
			includeEmail: true,
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
			provider: 'twitter',
			providerId: id,
			email: emails[0].value,
			firstName: name.givenName,
			lastName: name.familyName,
			picture: photos[0].value,
		};

		const data = { scope, payload: { from: 'twitter' } };

		done(null, data);
	}
}
