import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TsRestModule } from '@ts-rest/nest';
import { UsersModule } from '../users/users.module';
import { FeedController } from './controllers/feed.controller';
import { CreatePostUseCase } from './use-cases/create-post.use-case';
import { DeletePostUseCase } from './use-cases/delete-post.use-case';
import { UpdatePostUseCase } from './use-cases/update-post.use-case';
import { LikePostUseCase } from './use-cases/like-post.use-case';
import { UnlikePostUseCase } from './use-cases/unlike-post.use-case';
import { AddCommentToPostUseCase } from './use-cases/add-comment-to-post.use-case';
import { DeleteCommentUseCase } from './use-cases/delete-comment.use-case';
import { PostRepository } from './repositories/post.repository';
import { MongoosePostRepository } from './repositories/post.repository.impl';
import { PostLikeRepository } from './repositories/post-like.repository';
import { MongoosePostLikeRepository } from './repositories/post-like.repository.impl';
import { PostCommentRepository } from './repositories/post-comment.repository';
import { MongoosePostCommentRepository } from './repositories/post-comment.repository.impl';
import { PostDocument, PostSchema } from './schemas/post.schema';
import { PostLikeDocument, PostLikeSchema } from './schemas/post-like.schema';
import { PostCommentDocument, PostCommentSchema } from './schemas/post-comment.schema';
import { FEED_DAO } from './daos/feed.dao';
import { FeedDaoImpl } from './daos/feed.dao.impl';

@Module({
  imports: [
    TsRestModule.register({}),
    UsersModule,
    MongooseModule.forFeature([
      { name: PostDocument.name, schema: PostSchema },
      { name: PostLikeDocument.name, schema: PostLikeSchema },
      { name: PostCommentDocument.name, schema: PostCommentSchema },
    ]),
  ],
  controllers: [FeedController],
  providers: [
    CreatePostUseCase,
    DeletePostUseCase,
    UpdatePostUseCase,
    LikePostUseCase,
    UnlikePostUseCase,
    AddCommentToPostUseCase,
    DeleteCommentUseCase,
    { provide: PostRepository, useClass: MongoosePostRepository },
    { provide: PostLikeRepository, useClass: MongoosePostLikeRepository },
    { provide: PostCommentRepository, useClass: MongoosePostCommentRepository },
    { provide: FEED_DAO, useClass: FeedDaoImpl },
  ],
})
export class FeedModule {}
