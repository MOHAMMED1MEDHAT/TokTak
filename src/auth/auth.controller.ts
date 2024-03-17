import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	UseGuards,
} from '@nestjs/common';
import { UserEntity } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { GetUser } from './decorators';
import { AuthLoginCredentialsDto, AuthSignupCredentialsDto } from './dtos';
import { JwtAuthGuard, RefreshJwtAuthGuard } from './guards';
import { LoginResponse, MessageResponse } from './interfaces';
import { RefreshTokenResponse } from './interfaces/refreshTokenResponse.interface';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@HttpCode(HttpStatus.CREATED)
	@Post('signup')
	async signup(
		@Body() authDto: AuthSignupCredentialsDto,
	): Promise<MessageResponse> {
		return await this.authService.signUp(authDto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('login')
	async login(
		@Body() authDto: AuthLoginCredentialsDto,
	): Promise<LoginResponse> {
		return await this.authService.login(authDto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('refresh')
	@UseGuards(RefreshJwtAuthGuard)
	async refresh(@GetUser() uesr: UserEntity): Promise<RefreshTokenResponse> {
		return await this.authService.refresh(uesr.id);
	}

	@HttpCode(HttpStatus.OK)
	@UseGuards(JwtAuthGuard)
	@Get('logout')
	async logout(@GetUser() user: UserEntity): Promise<MessageResponse> {
		return await this.authService.logout(user);
	}
}
