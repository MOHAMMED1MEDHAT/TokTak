import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

const logger = new Logger('bootstrap');

async function bootstrap(): Promise<void> {
	const app = await NestFactory.create(AppModule);
	app.setGlobalPrefix('api/v1');
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
		}),
	);
	await app.listen(process.env.PORT || 3000);
	logger.verbose(
		`Application listening on port ${process.env.PORT || 3000} and time is ${new Date().toISOString()}`,
	);
}
bootstrap();
