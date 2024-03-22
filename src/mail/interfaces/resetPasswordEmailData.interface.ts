import { EmailData } from './emailData.interface';

export interface ResetPasswordEmailData extends EmailData {
	name: string;
	resetPasswordCode: string;
}
