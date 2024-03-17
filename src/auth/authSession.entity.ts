import {
	BaseEntity,
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

@Entity('authSession')
export class AuthSessionEntity extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	userId: string;

	@Column({
		type: 'simple-array',
		default: [],
	})
	rtcSockets: string[];

	@Column({
		type: 'simple-array',
		default: [],
	})
	notificationsSockets: string[];

	@Column({
		type: 'simple-array',
		default: [],
	})
	chatSockets: string[];

	@Column({
		type: 'simple-enum',
		enum: ['valid', 'expired'],
		default: 'valid',
	})
	status: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@DeleteDateColumn()
	deletedAt: Date;
}
