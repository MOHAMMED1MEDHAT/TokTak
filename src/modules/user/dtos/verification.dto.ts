import { MaxLength, MinLength } from 'class-validator';

export class VerificationCodeDto {
	@MaxLength(6, {
		message: 'Code is too long. Maximal length is $constraint1 characters, but actual is $value',
	})
	@MinLength(6, {
		message: 'Code is too short. Minimal length is $constraint1 characters, but actual is $value',
	})
	code: string;
}
