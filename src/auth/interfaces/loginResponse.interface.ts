import { UserEntity } from './../../user/user.entity';

export interface LoginResponse {
	user: UserEntity;
	access_token: string;
	refresh_token: string;
}
