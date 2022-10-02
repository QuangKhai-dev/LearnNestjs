import { AppModule } from './../src/app.module';
import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(3333);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();

    pactum.request.setBaseUrl('http://localhost:3333/');
  });

  afterAll(() => {
    app.close();
  });

  describe('Auth', () => {
    describe('Signup', () => {
      it('should Signup', () => {
        const dto: AuthDto = {
          email: 'quangkhai0903@gmail.com',
          password: '123456',
        };
        return pactum
          .spec()
          .post('auth/signUp')
          .withBody(dto)
          .expectStatus(201)
          .inspect();
      });
    });

    describe('Signin', () => {
      it.todo('should Signin');
    });
  });

  describe('User', () => {
    describe('Get me', () => {
      it.todo('get me user');
    });

    describe('Edit user', () => {
      it.todo('edit user');
    });
  });

  describe('Bookmarks', () => {
    describe('Get empty bookmarks', () => {
      it.todo('get empty bookmarks');
    });

    describe('Create bookmark', () => {
      it.todo('create bookmark');
    });

    describe('Get bookmarks', () => {
      it.todo('get bookmarks');
    });

    describe('Get bookmark by id', () => {
      it.todo('get bookmark by id');
    });

    describe('Edit bookmark by id', () => {
      it.todo('edit bookmark by id');
    });

    describe('Delete bookmark by id', () => {
      it.todo('delete bookmark by id');
    });
  });
});
