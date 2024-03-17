import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AuthSignupCredentialsDto } from 'src/auth/dtos';
import { UserEntity } from '../src/user/entities/user.entity';
import { AppModule } from './../src/app.module';

const validAuthSignupDto: AuthSignupCredentialsDto = {
	email: 'demo2273@gmail.com',
	password: '12345678910@Test',
	confirmPassword: '12345678910@Test',
	firstName: 'demo',
	lastName: 'demo',
};

const invalidAuthSignupDto: AuthSignupCredentialsDto = {
	email: 'demo2273@gmail.com',
	password: '12345678910',
	confirmPassword: '12345678',
	firstName: 'demo',
	lastName: 'demo',
};

async function clearDB(): Promise<void> {
	await UserEntity.delete({});
}

describe('app e2e', () => {
	let app: INestApplication;

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleRef.createNestApplication();
		await app
			.useGlobalPipes(
				new ValidationPipe({
					whitelist: true,
				}),
			)
			.init();
		const port = process.env.PORT || 3003;

		app.listen(port);

		pactum.request.setBaseUrl(`http://localhost:${port}`);
	});

	afterAll(async () => {
		await clearDB();
		await app.close();
	});

	describe('Auth', () => {
		describe('POST /auth/signup (user)', () => {
			it('should FAIL to signup because of the incomplete body', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody({
						email: invalidAuthSignupDto.email,
						password: invalidAuthSignupDto.password,
						firstName: invalidAuthSignupDto.firstName,
						lastName: invalidAuthSignupDto.lastName,
					})
					.expectStatus(400);
			});

			it('should FAIL to signup because of the invalid body', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody({
						...invalidAuthSignupDto,
					})
					.expectBody({
						error: 'Bad Request',
						message: ['Password too weak'],
						statusCode: 400,
					});
			});

			it('should FAIL to signup because of the passwords dose not match', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody({
						email: validAuthSignupDto.email,
						password: validAuthSignupDto.password,
						confirmPassword: '123456789@Test2',
						firstName: validAuthSignupDto.firstName,
						lastName: validAuthSignupDto.lastName,
					})
					.expectBody({
						error: 'Not Acceptable',
						message: 'Passwords do not match',
						statusCode: 406,
					});
			});

			it('should signup', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody(validAuthSignupDto)
					.expectBody({
						message: `User ${validAuthSignupDto.email} has been created`,
					})
					.expectStatus(201);
			});

			it('should FAIL signup because of the user already exists', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody(validAuthSignupDto)
					.expectBody({
						error: 'Conflict',
						message: 'User already exists',
						statusCode: 409,
					});
			});
		});

		describe('POST /auth/login (user)', () => {
			it('should FAIL to login because of the invalid body', () => {
				return pactum
					.spec()
					.post('/auth/login')
					.withBody({
						email: validAuthSignupDto.email,
					})
					.expectStatus(400);
			});

			it('should FAIL to login because of the incorrect password', () => {
				return pactum
					.spec()
					.post('/auth/login')
					.withBody({
						email: validAuthSignupDto.email,
						password: '12345678910@Test2',
					})
					.expectBody({ message: 'Invalid credentials', statusCode: 401 });
			});
			it('should login', () => {
				return pactum
					.spec()
					.post('/auth/login')
					.withBody(validAuthSignupDto)
					.expectStatus(200)
					.stores('userAt', 'data.access_token')
					.stores('userRt', 'data.refresh_token')
					.stores('userId', 'data.sub.id');
			});
		});

		describe('POST /auth/logout', () => {
			it('should logout', () => {
				return pactum
					.spec()
					.post('/auth/logout')
					.withBearerToken('$S{userAt} $S{userRt}')
					.expectStatus(200);
			});

			it('should FAIL to logout if not authenticated', () => {
				return pactum.spec().post('/auth/logout').expectStatus(401);
			});
		});

		describe('Auth again after changes', () => {
			it('should login again after the user is updated', () => {
				return pactum
					.spec()
					.post('/auth/login')
					.withBody(validAuthSignupDto)
					.expectStatus(200)
					.stores('userAt', 'data.token')
					.stores('userId', 'data.user.id');
			});
		});
	});

	// describe('User', () => {
	// 	describe('GET /users/me', () => {
	// 		it('should return the user profile', () => {
	// 			return pactum
	// 				.spec()
	// 				.get('/users/me')
	// 				.withHeaders({
	// 					Authorization: 'Bearer $S{userAt}',
	// 				})
	// 				.expectStatus(200);
	// 		});

	// 		it('should FAIL return the user profile if not authenticated', () => {
	// 			return pactum.spec().get('/users/me').expectStatus(401);
	// 		});
	// 	});

	// 	describe('PATCH /users/me/password', () => {
	// 		it("should update the user's password by if authenticated", () => {
	// 			return pactum
	// 				.spec()
	// 				.patch('/users/me/password')
	// 				.withHeaders({
	// 					Authorization: 'Bearer $S{userAt}',
	// 				})
	// 				.withBody({
	// 					oldPassword: '12345678',
	// 					newPassword: '123456789',
	// 				})
	// 				.expectStatus(200);
	// 		});

	// 		it("should FAIL update the user's password if not authenticated", () => {
	// 			return pactum
	// 				.spec()
	// 				.patch('/users/me/password')
	// 				.withBody({
	// 					oldPassword: '12345678',
	// 					newPassword: '123456789',
	// 				})
	// 				.expectStatus(401);
	// 		});
	// 	});

	// 	describe('PATCH /users/me', () => {
	// 		it("should FAIL update the user's info if not authenticated", () => {
	// 			return pactum
	// 				.spec()
	// 				.patch('/users/me')
	// 				.withBody({
	// 					email: 'mohammedmedhat2121@gmail.com',
	// 					firstName: 'mohammed',
	// 					lastName: 'medhat',
	// 					location: 'Cairo',
	// 				})
	// 				.expectStatus(401);
	// 		});

	// 		it("should FAIL update the user's info if the body is invalid", () => {
	// 			return pactum
	// 				.spec()
	// 				.patch('/users/me')
	// 				.withBody({
	// 					email: 'mohammedmedhat2121@gmail.com',
	// 					firstName: 'mohammed',
	// 					lastName: 'medhat',
	// 				})
	// 				.expectStatus(401);
	// 		});

	// 		it("should update the user's info by if authenticated", () => {
	// 			return pactum
	// 				.spec()
	// 				.patch('/users/me')
	// 				.withHeaders({
	// 					Authorization: 'Bearer $S{userAt}',
	// 				})
	// 				.withBody({
	// 					email: 'mohammedmedhat2121@gmail.com',
	// 					firstName: 'mohammed',
	// 					lastName: 'medhat',
	// 					location: 'Cairo',
	// 				})
	// 				.expectStatus(200);
	// 		});
	// 	});

	// 	describe('Auth again after changes', () => {
	// 		it('should FAIL login again after the user is updated', () => {
	// 			return pactum
	// 				.spec()
	// 				.post('/auth/login')
	// 				.withBody({
	// 					email: 'mohammedmedhat2121',
	// 					password: '123456789',
	// 				})
	// 				.expectStatus(400);
	// 		});

	// 		it('should login again after the user is updated', () => {
	// 			return pactum
	// 				.spec()
	// 				.post('/auth/login')
	// 				.withBody({
	// 					email: 'mohammedmedhat2121@gmail.com',
	// 					password: '123456789',
	// 				})
	// 				.expectStatus(200)
	// 				.stores('userAt', 'data.token')
	// 				.stores('userId', 'data.user.id');
	// 		});
	// 	});

	// 	describe('DELETE /users/me', () => {
	// 		it("should FAIL delete the user's info if user is not authenticated", () => {
	// 			return pactum.spec().delete('/users/me').expectStatus(401);
	// 		});

	// 		it("should delete the user's info if user is authenticated", () => {
	// 			return pactum
	// 				.spec()
	// 				.delete('/users/me')
	// 				.withHeaders({ Authorization: 'Bearer $S{userAt}' })
	// 				.expectStatus(200);
	// 		});
	// 	});
	// });
});
