import {
	Body,
	Controller,
	HttpCode,
	HttpStatus,
	Post,
	UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { AuthService } from './auth.service';
import { GetUser } from './decorators';
import { AuthDto } from './dtos';
import { ResponseObj } from './dtos/responseObj.dto';
import { JwtAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}
	@Post('register')
	async register(@Body() authDto: AuthDto): Promise<ResponseObj> {
		return await this.authService.register(authDto);
	}

	@HttpCode(HttpStatus.OK)
	@Post('login')
	async login(@Body() authDto: AuthDto): Promise<ResponseObj> {
		return await this.authService.login(authDto);
	}

	@HttpCode(HttpStatus.OK)
	@UseGuards(JwtAuthGuard)
	@Post('logout')
	async logout(@GetUser() user: User): Promise<ResponseObj> {
		return await this.authService.logout(user);
	}
}
