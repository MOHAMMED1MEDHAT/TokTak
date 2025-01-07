import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class AuthLoginCredentialsDto {
	@IsEmail()
	email: string;

	@IsString()
	@MinLength(10)
	@MaxLength(20)
	password: string;
}
