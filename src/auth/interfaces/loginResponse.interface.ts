import { UserEntity } from '../../user/entities/user.entity';

export interface LoginResponse {
	user: UserEntity;
	accessToken: string;
	refreshToken: string;
}
