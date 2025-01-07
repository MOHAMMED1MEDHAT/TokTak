import { UserEntity } from '../../user/schemas/user.entity';

export interface LoginResponse {
	user: UserEntity;
	accessToken: string;
	refreshToken: string;
}
