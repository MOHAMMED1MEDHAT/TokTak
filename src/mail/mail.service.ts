import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, Logger } from '@nestjs/common';
import { UserEntity } from './../user/entities';
import { EmailType } from './enums';

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
			default:
				this.logger.error('Invalid email type');
				break;
		}
	}

	private async sendUserConfirmation(user: UserEntity, code: string): Promise<void> {
		await this.mailerService.sendMail({
			to: user.email,
			from: '"Support Team" <support@toktak.com>',
			subject: 'Welcome to Toktak! Confirm your Email',
			template: './verification',
			context: {
				name: user.firstName,
				code,
			},
		});
	}

	private async sendPasswordReset(user: UserEntity, code: string): Promise<void> {
		await this.mailerService.sendMail({
			to: user.email,
			from: '"Support Team" <support@toktak.com>',
			subject: 'Reset your password!',
			template: './passwordReset',
			context: {
				name: user.firstName,
				code,
			},
		});
	}

	private async sendPasswordChanged(user: UserEntity): Promise<void> {
		await this.mailerService.sendMail({
			to: user.email,
			from: '"Support Team" <support@toktak.com>',
			subject: 'Your password has been changed!',
			template: './passwordChanged',
			context: {
				name: user.firstName,
			},
		});
	}

	private async sendWelcome(user: UserEntity): Promise<void> {
		await this.mailerService.sendMail({
			to: user.email,
			from: '"Support Team" <support@toktak.com>',
			subject: 'Welcome to Toktak',
			template: './welcome',
			context: {
				name: user.firstName,
			},
		});
	}
}
