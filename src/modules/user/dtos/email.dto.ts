import { IsEmail } from 'class-validator';

export class EmaiLDto {
	@IsEmail()
	email: string;
}
