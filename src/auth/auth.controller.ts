import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Logger,
	NotImplementedException,
	Post,
	UseGuards,
} from '@nestjs/common';
import { UserEntity } from '../user/entities';
import { AuthService } from './auth.service';
import { GetPayload, GetUser } from './decorators';
import { AuthLoginCredentialsDto, AuthSignupCredentialsDto, VerificationCodeDto } from './dtos';
import { GoogleOauthGuard, JwtAuthGuard, RefreshJwtAuthGuard } from './guards';
import { JwtPayload, LoginResponse, MessageResponse, RefreshTokenResponse } from './interfaces';

@Controller('auth')
export class AuthController {
	private logger = new Logger(AuthController.name);

	constructor(private authService: AuthService) {}

	@Get('google')
	@UseGuards(GoogleOauthGuard)
	async googleAuth(@GetUser() user: UserEntity): Promise<void> {
		this.logger.debug(user);
	}

	@Get('google/callback')
	@UseGuards(GoogleOauthGuard)
	async googleAuthCallback(@GetUser() user: any): Promise<void> {
		this.logger.debug(user);
	}

	@HttpCode(HttpStatus.CREATED)
	@Post('signup')
	async signup(@Body() authDto: AuthSignupCredentialsDto): Promise<MessageResponse> {
		return await this.authService.signUp(authDto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('verify')
	async verify(@Body() verificationCodeDto: VerificationCodeDto): Promise<MessageResponse> {
		return await this.authService.verifyUserEmail(verificationCodeDto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('login')
	async login(@Body() authDto: AuthLoginCredentialsDto): Promise<LoginResponse> {
		return await this.authService.login(authDto);
	}

	@HttpCode(HttpStatus.CREATED)
	@Get('refresh')
	@UseGuards(RefreshJwtAuthGuard)
	async refresh(@GetUser() user: UserEntity): Promise<RefreshTokenResponse> {
		return await this.authService.refresh(user.id);
	}

	@HttpCode(HttpStatus.OK)
	@UseGuards(JwtAuthGuard)
	@Get('logout')
	async logout(
		@GetUser() user: UserEntity,
		@GetPayload() payload: JwtPayload,
	): Promise<MessageResponse> {
		// this.logger.verbose(user.id);
		// this.logger.verbose(req.headers);
		return await this.authService.logout(user, payload);
	}

	@HttpCode(HttpStatus.OK)
	@Post('forgotPassword')
	async forgotPassword(): Promise<void> {
		throw new NotImplementedException();
	}

	@HttpCode(HttpStatus.OK)
	@Post('verifyResetCode')
	async verifyResetCode(): Promise<void> {
		throw new NotImplementedException();
	}

	@HttpCode(HttpStatus.OK)
	@Post('resetPassword')
	async resetPassword(): Promise<void> {
		throw new NotImplementedException();
	}
}
