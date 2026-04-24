import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { CreatePostInput, FeedPostItem } from '@coffee-lovers/shared';
import { UserRepository } from '../../users/repositories/user.repository';
import { Post } from '../domain/post.entity';
import { PostRepository } from '../repositories/post.repository';
import { FEED_DAO, type FeedDao } from '../daos/feed.dao';

/**
 * Cria post manual do feed. Para o fluxo "compartilhar equipamento novo", ver
 * `CreatePostFromUserEquipamentUseCase` (stub) e o schema de `Post` (kind, userEquipamentId).
 */
@Injectable()
export class CreatePostUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly userRepository: UserRepository,
    @Inject(FEED_DAO) private readonly feedDao: FeedDao,
  ) {}

  async execute(
    input: CreatePostInput,
    authorId: string,
  ): Promise<FeedPostItem> {
    const user = await this.userRepository.findById(authorId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    const post = Post.createFromInput(input, authorId);
    const created = await this.postRepository.create(post);
    const id = created.getId();
    if (!id) {
      throw new Error('expected post id after create');
    }
    const item = await this.feedDao.getPostItemById(id, authorId);
    if (!item) {
      throw new Error('expected post in feed after create');
    }
    return item;
  }
}
