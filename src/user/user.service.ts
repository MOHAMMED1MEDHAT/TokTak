import { Injectable, NotAcceptableException } from '@nestjs/common';
import { MessageResponse } from './../auth/interfaces';
import { EmailType } from './../mail/enums';
import { MailService } from './../mail/mail.service';
import { EmaiLDto } from './dtos';
import { VerificationCodeDto } from './dtos/verification.dto';
import { UserEntity } from './entities';
import { UserRepository } from './repositories';

@Injectable()
export class UserService {
	constructor(
		private userRepository: UserRepository,
		private mailService: MailService,
	) {}

	async changeEmail(user: UserEntity): Promise<MessageResponse> {
		const code = await this.userRepository.generateEmailCode(user.id);

		// Send email with code
		await this.mailService.sendMail(user, EmailType.EMAIL_UPDATE, code);

		return { message: `we sent you a confirmation code in your email:${user.email}` };
	}

	async verifyEmailUpdateCode(
		verificationCodeDto: VerificationCodeDto,
		user: UserEntity,
	): Promise<MessageResponse> {
		const { code } = verificationCodeDto;
		const result = await this.userRepository.verifyEmailCode(code, user.id);
		if (!result) {
			throw new NotAcceptableException('Invalid verification Code');
		}
		return { message: 'code verified successfully' };
	}

	async updateEmail(emailDto: EmaiLDto, user: UserEntity): Promise<UserEntity> {
		const { email } = emailDto;
		return this.userRepository.updateEmail(email, user.id);
	}

	async changeProfileImage(userId: string, profileImage: string): Promise<void> {
		return this.userRepository.updateProfileImage(userId, profileImage);
	}
}
