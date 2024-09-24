import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from 'src/libs/mail/mail.service';
import { UserRepository } from './repositories';
import { UserEntity } from './schemas';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity])],
	providers: [UserService, UserRepository, MailService],
	controllers: [UserController],
})
export class UserModule {}
