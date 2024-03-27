import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Logger,
	NotImplementedException,
	Post,
	Req,
	UseGuards,
} from '@nestjs/common';
import { EmaiLDto } from 'src/user/dtos';
import { UserEntity } from '../user/entities';
import { AuthService } from './auth.service';
import { GetOauthScopeData, GetPayload, GetUser } from './decorators';
import {
	AuthLoginCredentialsDto,
	AuthSignupCredentialsDto,
	PasswordResetDto,
	VerificationAuthCodeDto,
} from './dtos';
import {
	FacebookOauthGuard,
	GoogleOauthGuard,
	JwtAuthGuard,
	RefreshJwtAuthGuard,
	TwitterOauthGuard,
} from './guards';
import {
	JwtPayload,
	LoginResponse,
	MessageResponse,
	OauthScopeData,
	RefreshTokenResponse,
} from './interfaces';

@Controller('auth')
export class AuthController {
	private logger = new Logger(AuthController.name);

	constructor(private authService: AuthService) {}

	@Get('google')
	@UseGuards(GoogleOauthGuard)
	async googleAuth(): Promise<void> {}

	@Get('google/callback')
	@UseGuards(GoogleOauthGuard)
	async googleAuthCallback(
		@GetOauthScopeData() data: OauthScopeData,
	): Promise<MessageResponse | LoginResponse | void> {
		return await this.authService.externalAuthentication(data);
	}

	@Get('facebook')
	@UseGuards(FacebookOauthGuard)
	async facebookAuth(@Req() req: Request): Promise<void> {
		// console.log(req);
		throw new NotImplementedException();
	}

	@Get('facebook/callback')
	@UseGuards(FacebookOauthGuard)
	async facebookAuthCallback(@Req() req: Request): Promise<MessageResponse | LoginResponse | void> {
		// console.log(req);
		throw new NotImplementedException();
		// return await this.authService.externalAuthentication(data);
	}

	@Get('twitter')
	@UseGuards(TwitterOauthGuard)
	async twitterAuth(@Req() req: Request): Promise<void> {
		console.log(req);
		throw new NotImplementedException();
	}

	@Get('twitter/callback')
	@UseGuards(TwitterOauthGuard)
	async twitterAuthCallback(@Req() req: Request): Promise<MessageResponse | LoginResponse | void> {
		console.log(req);
		throw new NotImplementedException();
		// return await this.authService.externalAuthentication(data);
	}

	@HttpCode(HttpStatus.CREATED)
	@Post('signup')
	async signup(@Body() authDto: AuthSignupCredentialsDto): Promise<MessageResponse> {
		return await this.authService.signUp(authDto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('verify')
	async verify(@Body() verificationAuthCodeDto: VerificationAuthCodeDto): Promise<MessageResponse> {
		return await this.authService.verifyUserEmail(verificationAuthCodeDto);
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
	async forgotPassword(@Body() emailDto: EmaiLDto): Promise<MessageResponse> {
		return await this.authService.forgotPassword(emailDto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('verifyResetCode')
	async verifyResetCode(
		@Body() verificationAuthCodeDto: VerificationAuthCodeDto,
	): Promise<MessageResponse> {
		return await this.authService.verifyResetCode(verificationAuthCodeDto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('resetPassword')
	async resetPassword(@Body() passwordResetDto: PasswordResetDto): Promise<MessageResponse> {
		return await this.authService.resetPassword(passwordResetDto);
	}
}
