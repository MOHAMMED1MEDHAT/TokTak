import { Injectable } from '@nestjs/common';
import { MessageResponse } from 'src/auth/interfaces';
import { EmailType } from 'src/mail/enums';
import { MailService } from 'src/mail/mail.service';
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

	async verifyEmailUpdateCode(code: string, user: UserEntity): Promise<MessageResponse> {
		const result = await this.userRepository.verifyEmailCode(code, user.id);
		if (!result) {
			return { message: 'Invalid code' };
		}
		return { message: 'Email updated successfully' };
	}

	async updateEmail(email: string, user: UserEntity): Promise<UserEntity> {
		return this.userRepository.updateEmail(email, user.id);
	}

	async changeProfileImage(userId: string, profileImage: string): Promise<void> {
		return this.userRepository.updateProfileImage(userId, profileImage);
	}
}
