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
import { GetUser } from './../auth/decorators';
import { JwtAuthGuard } from './../auth/guards';
import { MessageResponse } from './../auth/interfaces';
import { EmaiLDto, VerificationCodeDto } from './dtos';
import { UserEntity } from './entities';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
	constructor(private userService: UserService) {}

	@HttpCode(HttpStatus.OK)
	@Get('changeEmailRequest')
	async changeEmail(@GetUser() user: UserEntity): Promise<MessageResponse> {
		return await this.userService.changeEmail(user);
	}

	@HttpCode(HttpStatus.OK)
	@Post('verifyEmailUpdateCode')
	async verifyEmailCode(
		@Body() codeDto: VerificationCodeDto,
		@GetUser() user: UserEntity,
	): Promise<MessageResponse> {
		return await this.userService.verifyEmailUpdateCode(codeDto, user);
	}

	@HttpCode(HttpStatus.OK)
	@Patch('email')
	async addNewEmail(@Body() emailDto: EmaiLDto, @GetUser() user: UserEntity): Promise<UserEntity> {
		return await this.userService.updateEmail(emailDto, user);
	}
}
