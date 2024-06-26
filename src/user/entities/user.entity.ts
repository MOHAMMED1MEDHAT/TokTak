import {
	BaseEntity,
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	Entity,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';
import { UserRole } from '../enums';
import { Gender } from '../enums/gender.enum';

@Entity('user')
export class UserEntity extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	firstName: string;

	@Column()
	lastName: string;

	@Column({ unique: true })
	email: string;

	@Column({
		nullable: true,
	})
	passwordHash: string;

	@Column({
		nullable: true,
	})
	photo: string;

	@Column({
		type: 'enum',
		enum: Gender,
		nullable: true,
	})
	gender: Gender;

	@Column({
		type: 'date',
		nullable: true,
	})
	dateOfBirth: Date;

	@Column({
		type: 'simple-array',
		default: [],
	})
	following: string[];

	@Column({
		type: 'simple-array',
		default: [],
	})
	followers: string[];

	@Column({
		type: 'integer',
		default: 0,
	})
	numOfFollowers: number;

	@Column({
		type: 'simple-array',
		default: [],
	})
	subscriptions: string[];

	@Column({
		type: 'integer',
		default: 0,
	})
	numOfFollowing: number;

	@Column({
		type: 'simple-array',
		default: [],
	})
	posts: string[];

	@Column({
		type: 'simple-array',
		default: [],
	})
	likedPosts: string[];

	@Column({
		type: 'simple-array',
		default: [],
	})
	savedPosts: string[];

	@Column({
		type: 'integer',
		default: 0,
	})
	numOfPosts: number;

	@Column({ nullable: true })
	bio: string;

	@Column({
		type: 'simple-array',
		default: [],
	})
	preferredCategories: string[];

	@Column({ default: 'en' })
	language: string;

	@Column({ type: 'enum', enum: UserRole, default: UserRole.GEST })
	role: UserRole;

	@Column({ default: true })
	isActive: boolean;

	@Column({ default: false })
	isAdmin: boolean;

	@Column({
		nullable: true,
		length: 6,
	})
	passwordResetCode: string;

	@Column({
		type: 'date',
		nullable: true,
	})
	passwordResetCodeExpires: Date;

	@Column({ type: 'date', nullable: true })
	passwordChangedAt: Date;

	@Column({ nullable: true })
	emailConfirmationCode: string;

	@Column({ type: 'date', nullable: true })
	emailConfirmationCodeExpires: Date;

	@Column({ default: false })
	isEmailConfirmed: boolean;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@DeleteDateColumn()
	deletedAt: Date;

	//// @BeforeInsert()
	// async hashPassword(): Promise<void> {
	// 	this.password = await argon.hash(this.password);
	// }
}
