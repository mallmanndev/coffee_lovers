import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';
import { PostLikeRepository } from '../repositories/post-like.repository';
import { PostCommentRepository } from '../repositories/post-comment.repository';

@Injectable()
export class DeletePostUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly likeRepository: PostLikeRepository,
    private readonly commentRepository: PostCommentRepository,
  ) {}

  async execute(postId: string, userId: string): Promise<void> {
    const post = await this.postRepository.findByIdAndAuthorId(postId, userId);
    if (!post) {
      const any = await this.postRepository.findById(postId);
      if (!any) {
        throw new NotFoundException('Post não encontrado');
      }
      throw new ForbiddenException('Apenas o autor pode excluir o post');
    }
    await this.commentRepository.deleteByPostId(postId);
    await this.likeRepository.deleteByPostId(postId);
    await this.postRepository.deleteById(postId);
  }
}
