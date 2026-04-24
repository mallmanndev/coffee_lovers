import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PostDocument } from '../src/feed/schemas/post.schema';
import { PostLikeDocument } from '../src/feed/schemas/post-like.schema';
import { PostCommentDocument } from '../src/feed/schemas/post-comment.schema';
import { UserDocument } from '../src/users/schemas/user.schema';

describe('Feed (e2e)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let postModel: Model<PostDocument>;
  let likeModel: Model<PostLikeDocument>;
  let commentModel: Model<PostCommentDocument>;
  let userModel: Model<UserDocument>;

  const userId = '60d0fe4f5311236168a109cc';

  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
    process.env.MONGODB_URI =
      process.env.MONGODB_URI || 'mongodb://localhost:27017/coffee_lovers_test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    jwtService = moduleFixture.get<JwtService>(JwtService);
    postModel = moduleFixture.get<Model<PostDocument>>(
      getModelToken(PostDocument.name),
    );
    likeModel = moduleFixture.get<Model<PostLikeDocument>>(
      getModelToken(PostLikeDocument.name),
    );
    commentModel = moduleFixture.get<Model<PostCommentDocument>>(
      getModelToken(PostCommentDocument.name),
    );
    userModel = moduleFixture.get<Model<UserDocument>>(
      getModelToken(UserDocument.name),
    );
  });

  beforeEach(async () => {
    await postModel.deleteMany({});
    await likeModel.deleteMany({});
    await commentModel.deleteMany({});
    await userModel.deleteMany({ _id: new Types.ObjectId(userId) });
    await userModel.create({
      _id: new Types.ObjectId(userId),
      name: 'Feed E2E User',
      email: 'feed-e2e@example.com',
      passwordHash: 'h',
      city: 'C',
      state: 'S',
    });
  });

  afterAll(async () => {
    await app.close();
  });

  function token() {
    return jwtService.sign({
      sub: userId,
      email: 'feed-e2e@example.com',
      name: 'Feed E2E User',
    });
  }

  it('flow: post → list → like → comment → list feed → delete comment → unlike → delete post', async () => {
    const t = `Bearer ${token()}`;

    const createRes = await request(app.getHttpServer())
      .post('/feed/posts')
      .set('Authorization', t)
      .send({ message: 'Novo no feed', imageUrls: [], kind: 'user' });
    expect(createRes.status).toBe(201);
    expect(createRes.body.message).toBe('Novo no feed');
    expect(createRes.body.author.id).toBe(userId);
    const postId = createRes.body.id as string;

    const list0 = await request(app.getHttpServer())
      .get('/feed/posts')
      .set('Authorization', t)
      .query({ limit: 10 });
    expect(list0.status).toBe(200);
    expect(list0.body.items).toHaveLength(1);
    expect(list0.body.items[0].id).toBe(postId);
    expect(list0.body.items[0].likeCount).toBe(0);
    expect(list0.body.items[0].commentCount).toBe(0);
    expect(list0.body.nextCursor).toBeNull();

    const likeRes = await request(app.getHttpServer())
      .post(`/feed/posts/${postId}/like`)
      .set('Authorization', t)
      .send({});
    expect(likeRes.status).toBe(200);
    expect(likeRes.body).toEqual({ liked: true });

    const commRes = await request(app.getHttpServer())
      .post(`/feed/posts/${postId}/comments`)
      .set('Authorization', t)
      .send({ message: 'Boa!' });
    expect(commRes.status).toBe(201);
    const commentId = commRes.body.id as string;

    const commList = await request(app.getHttpServer())
      .get(`/feed/posts/${postId}/comments`)
      .set('Authorization', t);
    expect(commList.status).toBe(200);
    expect(commList.body.items).toHaveLength(1);
    expect(commList.body.items[0].message).toBe('Boa!');

    const list1 = await request(app.getHttpServer())
      .get('/feed/posts')
      .set('Authorization', t);
    expect(list1.body.items[0].likeCount).toBe(1);
    expect(list1.body.items[0].commentCount).toBe(1);
    expect(list1.body.items[0].likedByMe).toBe(true);

    const delC = await request(app.getHttpServer())
      .delete(
        `/feed/posts/${postId}/comments/${commentId}`,
      )
      .set('Authorization', t)
      .send({});
    expect(delC.status).toBe(204);

    const unlike = await request(app.getHttpServer())
      .delete(`/feed/posts/${postId}/like`)
      .set('Authorization', t)
      .send({});
    expect(unlike.status).toBe(200);
    expect(unlike.body).toEqual({ liked: false });

    const delP = await request(app.getHttpServer())
      .delete(`/feed/posts/${postId}`)
      .set('Authorization', t)
      .send({});
    expect(delP.status).toBe(204);

    const list2 = await request(app.getHttpServer())
      .get('/feed/posts')
      .set('Authorization', t);
    expect(list2.body.items).toHaveLength(0);
  });
});
