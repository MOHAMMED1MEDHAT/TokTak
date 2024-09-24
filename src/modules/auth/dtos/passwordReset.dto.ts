import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export class PasswordResetDto {
	@IsString()
	token: string;

	@IsString()
	@MinLength(10, {
		message:
			'Password is too short. Minimal length is $constraint1 characters, but actual is $value',
	})
	@MaxLength(20, {
		message:
			'Password is too long. Maximal length is $constraint1 characters, but actual is $value',
	})
	@Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
		message: 'Password too weak',
	})
	password: string;

	@IsString()
	confirmPassword: string;
}
