import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Logger,
	Post,
	UseGuards,
} from '@nestjs/common';
import { UserEntity } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { GetPayload, GetUser } from './decorators';
import { AuthLoginCredentialsDto, AuthSignupCredentialsDto } from './dtos';
import { JwtAuthGuard, RefreshJwtAuthGuard } from './guards';
import {
	JwtPayload,
	LoginResponse,
	MessageResponse,
	RefreshTokenResponse,
} from './interfaces';

@Controller('auth')
export class AuthController {
	private logger = new Logger('AuthController');

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
}
