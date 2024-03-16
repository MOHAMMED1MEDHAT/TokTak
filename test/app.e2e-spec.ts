import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as pactum from 'pactum';
import { AppModule } from '../src/app.module';

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
		await app.close();
	});

	describe('Auth', () => {
		const userDto = {
			email: 'mohammedmedhat@gmail.com',
			password: '12345678',
		};

		describe('POST /auth/signup (user)', () => {
			it('should FAIL to signup because of the invalid body', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody({ email: userDto.email })
					.expectStatus(400);
			});

			it('should signup', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody(userDto)
					.expectStatus(201);
			});

			it('should FAIL signup because of the user already exists', () => {
				return pactum
					.spec()
					.post('/auth/signup')
					.withBody(userDto)
					.expectStatus(400);
			});
		});

		describe('POST /auth/login (user)', () => {
			it('should FAIL to login because of the invalid body', () => {
				return pactum
					.spec()
					.post('/auth/login')
					.withBody({
						email: userDto.email,
					})
					.expectStatus(400);
			});

			it('should FAIL to login because of the incorrect password', () => {
				return pactum
					.spec()
					.post('/auth/login')
					.withBody({
						email: userDto.email,
						password: '12345',
					})
					.expectBody({
						message: 'Invalid Credentials',
						error: 'Bad Request',
						statusCode: 400,
					})
					.expectStatus(400);
			});
			it('should login', () => {
				return pactum
					.spec()
					.post('/auth/login')
					.withBody(userDto)
					.expectStatus(200)
					.stores('userAt', 'data.token')
					.stores('userId', 'data.user.id');
			});
		});

		describe('POST /auth/logout', () => {
			it('should logout', () => {
				return pactum
					.spec()
					.post('/auth/logout')
					.withBearerToken('$S{userAt}')
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
					.withBody(userDto)
					.expectStatus(200)
					.stores('userAt', 'data.token')
					.stores('userId', 'data.user.id');
			});
		});
	});

	describe('Jobs', () => {
		const jobDto = {
			position: 'Software Engineer',
			company: 'Google',
			jobLocation: 'Cairo',
			status: 'PENDING',
			type: 'FULL_TIME',
		};

		describe('POST /jobs', () => {
			it('should create the job', () => {
				return pactum
					.spec()
					.post('/jobs')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}',
					})
					.withBody(jobDto)
					.expectStatus(201)
					.stores('jobId', 'data.job.id');
			});

			it('should FAIL create a job cause the user is not authenticated', () => {
				return pactum.spec().post('/jobs').withBody(jobDto).expectStatus(401);
			});
		});

		describe('PATCH /jobs/:id', () => {
			it("should FAIL update the job's info by it's id if the id does not exists", () => {
				return pactum
					.spec()
					.patch('/jobs/1weqrfdsas')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}',
					})
					.withBody(jobDto)
					.expectStatus(404);
			});

			it("should update the job's info by it's id and return the updated job", () => {
				return pactum
					.spec()
					.patch('/jobs/$S{jobId}')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}',
					})
					.withBody({
						position: 'Software Engineer',
						company: 'Facebook',
						jobLocation: 'Cairo',
						status: 'PENDING',
						type: 'FULL_TIME',
					})
					.expectStatus(200);
			});

			it("should FAIL update the job's info by it's id if authenticated", () => {
				return pactum
					.spec()
					.patch('/jobs/$S{jobId}')
					.withBody(jobDto)
					.expectStatus(401);
			});

			it("should FAIL update the job's info by it's id if the body is not valid", () => {
				return pactum
					.spec()
					.patch('/jobs/$S{jobId}')
					.withBearerToken('$S{userAt}')
					.withBody({
						position: 'Software Engineer',
						company: 'Facebook',
					})
					.expectStatus(400);
			});
		});

		describe('GET /jobs', () => {
			it("should FAIL to return all user's jobs because he has no auth token", () => {
				return pactum.spec().get('/jobs').expectStatus(401);
			});

			it('should return all jobs', () => {
				return pactum
					.spec()
					.get('/jobs')
					.withBearerToken('$S{userAt}')
					.expectStatus(200);
			});
		});

		describe('GET /jobs/:id', () => {
			it('should FAIL return the job info if not authenticated', () => {
				return pactum.spec().get('/jobs/$S{jobId}').expectStatus(401);
			});

			it('should return not found id', () => {
				return pactum
					.spec()
					.get('/jobs/1weqrfdsas')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}',
					})
					.expectStatus(404);
			});

			it("should return job info by it's id", () => {
				return pactum
					.spec()
					.get('/jobs/$S{jobId}')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}',
					})
					.expectStatus(200);
			});
		});

		describe('DELETE /jobs/:id', () => {
			it("should FAIL delete the job's info by it's id if not authenticated", () => {
				return pactum.spec().delete('/jobs/$S{jobId}').expectStatus(401);
			});

			it("should FAIL delete the job's info by it's id if the id is invalid", () => {
				return pactum
					.spec()
					.delete('/jobs/1weqrfdsas')
					.withBearerToken('$S{userAt}')
					.expectStatus(404);
			});

			it("should delete the job's info by it's id", () => {
				return pactum
					.spec()
					.delete('/jobs/$S{jobId}')
					.withHeaders({ Authorization: 'Bearer $S{userAt}' })
					.expectStatus(200);
			});
		});
	});

	describe('User', () => {
		describe('GET /users/me', () => {
			it('should return the user profile', () => {
				return pactum
					.spec()
					.get('/users/me')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}',
					})
					.expectStatus(200);
			});

			it('should FAIL return the user profile if not authenticated', () => {
				return pactum.spec().get('/users/me').expectStatus(401);
			});
		});

		describe('PATCH /users/me/password', () => {
			it("should update the user's password by if authenticated", () => {
				return pactum
					.spec()
					.patch('/users/me/password')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}',
					})
					.withBody({
						oldPassword: '12345678',
						newPassword: '123456789',
					})
					.expectStatus(200);
			});

			it("should FAIL update the user's password if not authenticated", () => {
				return pactum
					.spec()
					.patch('/users/me/password')
					.withBody({
						oldPassword: '12345678',
						newPassword: '123456789',
					})
					.expectStatus(401);
			});
		});

		describe('PATCH /users/me', () => {
			it("should FAIL update the user's info if not authenticated", () => {
				return pactum
					.spec()
					.patch('/users/me')
					.withBody({
						email: 'mohammedmedhat2121@gmail.com',
						firstName: 'mohammed',
						lastName: 'medhat',
						location: 'Cairo',
					})
					.expectStatus(401);
			});

			it("should FAIL update the user's info if the body is invalid", () => {
				return pactum
					.spec()
					.patch('/users/me')
					.withBody({
						email: 'mohammedmedhat2121@gmail.com',
						firstName: 'mohammed',
						lastName: 'medhat',
					})
					.expectStatus(401);
			});

			it("should update the user's info by if authenticated", () => {
				return pactum
					.spec()
					.patch('/users/me')
					.withHeaders({
						Authorization: 'Bearer $S{userAt}',
					})
					.withBody({
						email: 'mohammedmedhat2121@gmail.com',
						firstName: 'mohammed',
						lastName: 'medhat',
						location: 'Cairo',
					})
					.expectStatus(200);
			});
		});

		describe('Auth again after changes', () => {
			it('should FAIL login again after the user is updated', () => {
				return pactum
					.spec()
					.post('/auth/login')
					.withBody({
						email: 'mohammedmedhat2121',
						password: '123456789',
					})
					.expectStatus(400);
			});

			it('should login again after the user is updated', () => {
				return pactum
					.spec()
					.post('/auth/login')
					.withBody({
						email: 'mohammedmedhat2121@gmail.com',
						password: '123456789',
					})
					.expectStatus(200)
					.stores('userAt', 'data.token')
					.stores('userId', 'data.user.id');
			});
		});

		describe('DELETE /users/me', () => {
			it("should FAIL delete the user's info if user is not authenticated", () => {
				return pactum.spec().delete('/users/me').expectStatus(401);
			});

			it("should delete the user's info if user is authenticated", () => {
				return pactum
					.spec()
					.delete('/users/me')
					.withHeaders({ Authorization: 'Bearer $S{userAt}' })
					.expectStatus(200);
			});
		});
	});
});
