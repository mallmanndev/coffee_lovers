import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { FeedPostItem, UpdatePostInput } from '@coffee-lovers/shared';
import { Post } from '../domain/post.entity';
import { PostRepository } from '../repositories/post.repository';
import { FEED_DAO, type FeedDao } from '../daos/feed.dao';

@Injectable()
export class UpdatePostUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    @Inject(FEED_DAO) private readonly feedDao: FeedDao,
  ) {}

  async execute(
    postId: string,
    input: UpdatePostInput,
    userId: string,
  ): Promise<FeedPostItem> {
    const existing = await this.postRepository.findByIdAndAuthorId(
      postId,
      userId,
    );
    if (!existing) {
      const any = await this.postRepository.findById(postId);
      if (!any) {
        throw new NotFoundException('Post não encontrado');
      }
      throw new ForbiddenException('Apenas o autor pode editar o post');
    }
    const updated = Post.fromExistingWithUpdate(existing, input);
    await this.postRepository.update(updated);
    const item = await this.feedDao.getPostItemById(postId, userId);
    if (!item) {
      throw new Error('expected post in feed after update');
    }
    return item;
  }
}
