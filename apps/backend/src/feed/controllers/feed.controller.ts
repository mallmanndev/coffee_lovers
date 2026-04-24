import { Controller, Inject, UseGuards } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { feedContract } from '@coffee-lovers/shared';
import type { FeedDao } from '../daos/feed.dao';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CreatePostUseCase } from '../use-cases/create-post.use-case';
import { DeletePostUseCase } from '../use-cases/delete-post.use-case';
import { LikePostUseCase } from '../use-cases/like-post.use-case';
import { UnlikePostUseCase } from '../use-cases/unlike-post.use-case';
import { AddCommentToPostUseCase } from '../use-cases/add-comment-to-post.use-case';
import { DeleteCommentUseCase } from '../use-cases/delete-comment.use-case';
import { FEED_DAO } from '../daos/feed.dao';
import { PostRepository } from '../repositories/post.repository';

@Controller()
export class FeedController {
  constructor(
    private readonly createPostUseCase: CreatePostUseCase,
    private readonly deletePostUseCase: DeletePostUseCase,
    private readonly likePostUseCase: LikePostUseCase,
    private readonly unlikePostUseCase: UnlikePostUseCase,
    private readonly addCommentToPostUseCase: AddCommentToPostUseCase,
    private readonly deleteCommentUseCase: DeleteCommentUseCase,
    @Inject(FEED_DAO) private readonly feedDao: FeedDao,
    private readonly postRepository: PostRepository,
  ) {}

  @TsRestHandler(feedContract.createPost)
  @UseGuards(JwtAuthGuard)
  async createPost(
    @CurrentUser() user: { sub: string },
  ): Promise<unknown> {
    return tsRestHandler(feedContract.createPost, async ({ body }) => {
      const result = await this.createPostUseCase.execute(body, user.sub);
      return { status: 201, body: result };
    });
  }

  @TsRestHandler(feedContract.listPosts)
  @UseGuards(JwtAuthGuard)
  async listPosts(
    @CurrentUser() user: { sub: string },
  ): Promise<unknown> {
    return tsRestHandler(feedContract.listPosts, async ({ query }) => {
      const limit = query.limit ?? 20;
      const result = await this.feedDao.listPosts(
        user.sub,
        limit,
        query.cursor,
      );
      return { status: 200, body: result };
    });
  }

  @TsRestHandler(feedContract.deletePost)
  @UseGuards(JwtAuthGuard)
  async deletePost(
    @CurrentUser() user: { sub: string },
  ): Promise<unknown> {
    return tsRestHandler(feedContract.deletePost, async ({ params }) => {
      await this.deletePostUseCase.execute(params.id, user.sub);
      return { status: 204, body: null };
    });
  }

  @TsRestHandler(feedContract.likePost)
  @UseGuards(JwtAuthGuard)
  async likePost(
    @CurrentUser() user: { sub: string },
  ): Promise<unknown> {
    return tsRestHandler(feedContract.likePost, async ({ params }) => {
      const body = await this.likePostUseCase.execute(params.id, user.sub);
      return { status: 200, body };
    });
  }

  @TsRestHandler(feedContract.unlikePost)
  @UseGuards(JwtAuthGuard)
  async unlikePost(
    @CurrentUser() user: { sub: string },
  ): Promise<unknown> {
    return tsRestHandler(feedContract.unlikePost, async ({ params }) => {
      const body = await this.unlikePostUseCase.execute(params.id, user.sub);
      return { status: 200, body };
    });
  }

  @TsRestHandler(feedContract.addComment)
  @UseGuards(JwtAuthGuard)
  async addComment(
    @CurrentUser() user: { sub: string },
  ): Promise<unknown> {
    return tsRestHandler(feedContract.addComment, async ({ params, body }) => {
      const result = await this.addCommentToPostUseCase.execute(
        params.id,
        body,
        user.sub,
      );
      return { status: 201, body: result };
    });
  }

  @TsRestHandler(feedContract.listComments)
  @UseGuards(JwtAuthGuard)
  async listComments(
    @CurrentUser() _u: { sub: string },
  ): Promise<unknown> {
    return tsRestHandler(feedContract.listComments, async ({ params, query }) => {
      const post = await this.postRepository.findById(params.id);
      if (!post) {
        return { status: 404, body: { message: 'Post não encontrado' } };
      }
      const limit = query.limit ?? 30;
      const result = await this.feedDao.listComments(
        params.id,
        limit,
        query.cursor,
      );
      return { status: 200, body: result };
    });
  }

  @TsRestHandler(feedContract.deleteComment)
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @CurrentUser() user: { sub: string },
  ): Promise<unknown> {
    return tsRestHandler(
      feedContract.deleteComment,
      async ({ params }) => {
        await this.deleteCommentUseCase.execute(
          params.postId,
          params.commentId,
          user.sub,
        );
        return { status: 204, body: null };
      },
    );
  }
}
