import { EmailData } from './emailData.interface';

export interface EmailUpdateData extends EmailData {
	name: string;
	emailUpdateCode: string;
}
