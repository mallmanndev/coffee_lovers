import { Injectable, NotFoundException } from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';
import { PostLikeRepository } from '../repositories/post-like.repository';

@Injectable()
export class LikePostUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly likeRepository: PostLikeRepository,
  ) {}

  async execute(postId: string, userId: string): Promise<{ liked: true }> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }
    await this.likeRepository.addLike(userId, postId);
    return { liked: true };
  }
}
