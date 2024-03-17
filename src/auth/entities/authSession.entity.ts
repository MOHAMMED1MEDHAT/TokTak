import {
	BaseEntity,
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { AuthSessionStatus } from '../enums/authSessionType.enum';

@Entity('authSession')
export class AuthSessionEntity extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	userId: string;

	@Column()
	refreshToken: string;

	@Column({ nullable: true })
	rtcSocket: string;

	@Column({
		nullable: true,
	})
	notificationsSocket: string;

	@Column({ nullable: true })
	chatSocket: string;

	@Column({
		type: 'enum',
		enum: AuthSessionStatus,
		default: AuthSessionStatus.VALID,
	})
	status: AuthSessionStatus;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@DeleteDateColumn()
	deletedAt: Date;
}
