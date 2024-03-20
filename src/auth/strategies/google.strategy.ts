import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth2';
import { GoogleScopeData } from '../interfaces';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
	constructor() {
		super({
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.SERVER_URL + process.env.GOOGLE_CALLBACK_URL,
			scope: ['profile', 'email'],
		});
	}

	async validate(
		_accessToken: string,
		_refreshToken: string,
		profile: any,
		done: VerifyCallback,
	): Promise<any> {
		const { id, name, emails, photos } = profile;

		const scope: GoogleScopeData = {
			provider: 'google',
			providerId: id,
			email: emails[0].value,
			firstName: name.givenName,
			lastName: name.familyName,
			picture: photos[0].value,
		};

		const data = { scope, payload: { from: 'google' } };

		done(null, data);
	}
}
