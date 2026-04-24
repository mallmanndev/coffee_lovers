import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PostRepository } from '../repositories/post.repository';
import { PostCommentRepository } from '../repositories/post-comment.repository';

@Injectable()
export class DeleteCommentUseCase {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly commentRepository: PostCommentRepository,
  ) {}

  async execute(
    postId: string,
    commentId: string,
    userId: string,
  ): Promise<void> {
    const post = await this.postRepository.findById(postId);
    if (!post) {
      throw new NotFoundException('Post não encontrado');
    }
    const c = await this.commentRepository.findById(commentId);
    if (!c || c.getPostId() !== postId) {
      throw new NotFoundException('Comentário não encontrado');
    }
    if (c.getAuthorId() !== userId) {
      throw new ForbiddenException('Apenas o autor pode excluir o comentário');
    }
    await this.commentRepository.deleteById(commentId);
  }
}
