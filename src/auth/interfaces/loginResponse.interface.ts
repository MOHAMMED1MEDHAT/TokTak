import { UserEntity } from './../../user/user.entity';

export interface LoginResponse {
	user: UserEntity;
	accessToken: string;
	refreshToken: string;
}
