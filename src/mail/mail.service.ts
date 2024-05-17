import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { UserEntity } from '../user/schemas';
import { EmailType } from './enums';
import { EmailData, EmailUpdateData, ResetPasswordEmailData, VerifyEmailData } from './interfaces';

@Injectable()
export class MailService {
	private readonly logger = new Logger(MailService.name);
	constructor(private mailerService: MailerService) {}

	async sendMail(user: UserEntity, mailType: EmailType, code?: string): Promise<void> {
		switch (mailType) {
			case EmailType.USER_CONFIRMATION:
				await this.sendUserConfirmation(user, code);
				break;
			case EmailType.RESET_PASSWORD:
				await this.sendPasswordReset(user, code);
				break;
			case EmailType.PASSWORD_CHANGED:
				await this.sendPasswordChanged(user);
				break;
			case EmailType.USER_WELCOME:
				await this.sendWelcome(user);
				break;
			case EmailType.EMAIL_UPDATE:
				await this.sendEmailUpdate(user, code);
				break;
			default:
				this.logger.error('Invalid email type');
				break;
		}
	}

	private async sendUserConfirmation(user: UserEntity, code: string): Promise<void> {
		const data: VerifyEmailData = {
			name: user.firstName,
			verificationCode: code,
		};

		await this.mailerService.sendMail({
			to: user.email,
			subject: 'Welcome to Toktak! Confirm your Email',
			template: './verification',
			context: {
				name: data.name,
				code: data.verificationCode,
			},
		});
	}

	private async sendPasswordReset(user: UserEntity, code: string): Promise<void> {
		const data: ResetPasswordEmailData = {
			name: user.firstName,
			resetPasswordCode: code,
		};

		await this.mailerService.sendMail({
			to: user.email,
			subject: 'Reset your password!',
			template: './passwordReset',
			context: {
				name: data.name,
				code: data.resetPasswordCode,
			},
		});
	}

	private async sendEmailUpdate(user: UserEntity, code: string): Promise<void> {
		const data: EmailUpdateData = {
			name: user.firstName,
			emailUpdateCode: code,
		};

		await this.mailerService.sendMail({
			to: user.email,
			subject: 'Email update confirmation!',
			template: './emailUpdate',
			context: {
				name: data.name,
				code: data.emailUpdateCode,
			},
		});
	}

	private async sendPasswordChanged(user: UserEntity): Promise<void> {
		const data: EmailData = {
			name: user.firstName,
		};

		await this.mailerService.sendMail({
			to: user.email,
			subject: 'Your password has been changed!',
			template: './passwordChanged',
			context: {
				name: data.name,
			},
		});
	}

	private async sendWelcome(user: UserEntity): Promise<void> {
		const data: EmailData = {
			name: user.firstName,
		};

		await this.mailerService.sendMail({
			to: user.email,
			subject: 'Welcome to Toktak',
			template: './welcome',
			context: {
				name: data.name,
			},
		});
	}
}
