import { BadRequestException } from '@nestjs/common';
import { PostComment } from './post-comment.entity';

describe('PostComment entity', () => {
  it('creates a comment', () => {
    const c = PostComment.create({
      postId: 'p1',
      authorId: 'a1',
      message: ' Nice ',
    });
    expect(c.getMessage()).toBe('Nice');
    expect(c.getPostId()).toBe('p1');
  });

  it('rejects empty message', () => {
    expect(() =>
      PostComment.create({
        postId: 'p1',
        authorId: 'a1',
        message: '   ',
      }),
    ).toThrow(BadRequestException);
  });
});
