import {
	IsEmail,
	IsString,
	Matches,
	MaxLength,
	MinLength,
} from 'class-validator';

export class AuthSignupCredentialsDto {
	@IsEmail()
	email: string;

	@IsString()
	@MaxLength(20, {
		message:
			'First name is too long. Maximal length is $constraint1 characters, but actual is $value',
	})
	firstName: string;

	@IsString()
	@MaxLength(20, {
		message:
			'Last name is too long. Maximal length is $constraint1 characters, but actual is $value',
	})
	lastName: string;

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
	confirmPassword: string;
}
