import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Patch,
	Post,
	UseGuards,
} from '@nestjs/common';
import { GetUser } from 'src/auth/decorators';
import { JwtAuthGuard } from 'src/auth/guards';
import { MessageResponse } from 'src/auth/interfaces';
import { UserEntity } from './entities';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
	constructor(private userService: UserService) {}

	@HttpCode(HttpStatus.OK)
	@Get('changeEmail')
	async changeEmail(@GetUser() user: UserEntity): Promise<MessageResponse> {
		return await this.userService.changeEmail(user);
	}

	@HttpCode(HttpStatus.OK)
	@Post('verifyEmailUpdateCode')
	async verifyEmailCode(
		@Body('code') code: string,
		@GetUser() user: UserEntity,
	): Promise<MessageResponse> {
		return await this.userService.verifyEmailUpdateCode(code, user);
	}

	@HttpCode(HttpStatus.OK)
	@Patch('email')
	async addNewEmail(
		@GetUser() user: UserEntity,
		@Body('newEmail') email: string,
	): Promise<UserEntity> {
		return await this.userService.updateEmail(email, user);
	}
}
