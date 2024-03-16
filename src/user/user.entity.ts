import {
	BaseEntity,
	Column,
	CreateDateColumn,
	DeleteDateColumn,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from 'typeorm';

export class UserEntity extends BaseEntity {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column()
	firstName: string;

	@Column()
	lastName: string;

	@Column({ unique: true })
	email: string;

	@Column()
	password: string;

	@Column()
	photo: string;

	@Column()
	gender: string;

	@Column()
	dateOfBirth: Date;

	@Column()
	following: string[];

	@Column()
	followers: string[];

	@Column()
	numOfFollowers: number;

	@Column()
	subscriptions: string[];

	@Column()
	numOfFollowing: number;

	@Column()
	posts: string[];

	@Column()
	likedPosts: string[];

	@Column()
	savedPosts: string[];

	@Column()
	numOfPosts: number;

	@Column()
	bio: string;

	@Column({
		type: 'simple-array',
	})
	preferredCategories: string[];

	@Column({ default: 'en' })
	language: string;

	@Column({ default: 'user', enum: ['gest', 'user', 'admin'] })
	role: string;

	@Column({ default: true })
	isActive: boolean;

	@Column({ default: false })
	isAdmin: boolean;

	@Column()
	passwordResetToken: string;

	@Column()
	passwordResetTokenExpires: Date;

	@Column()
	passwordChangedAt: Date;

	@Column()
	emailConfirmationToken: string;

	@Column()
	emailConfirmationTokenExpires: Date;

	@Column({ default: false })
	isEmailConfirmed: boolean;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	@DeleteDateColumn()
	deletedAt: Date;

	// @BeforeInsert()
	// async hashPassword(): Promise<void> {
	// 	this.password = await argon.hash(this.password);
	// }
}
