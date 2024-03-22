import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailService } from 'src/mail/mail.service';
import { UserEntity } from './entities/user.entity';
import { UserRepository } from './repositories';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
	imports: [TypeOrmModule.forFeature([UserEntity])],
	providers: [UserService, UserRepository, MailService],
	controllers: [UserController],
})
export class UserModule {}
