import { EmailData } from './emailData.interface';

export interface VerifyEmailData extends EmailData {
	name: string;
	verificationCode: string;
}
