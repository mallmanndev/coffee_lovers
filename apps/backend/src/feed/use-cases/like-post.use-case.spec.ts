import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Post } from '../domain/post.entity';
import { PostRepository } from '../repositories/post.repository';
import { PostLikeRepository } from '../repositories/post-like.repository';
import { LikePostUseCase } from './like-post.use-case';

describe('LikePostUseCase', () => {
  let useCase: LikePostUseCase;
  const postRepo = {
    findById: jest.fn(),
  };
  const likeRepo = { addLike: jest.fn().mockResolvedValue({}) };

  beforeEach(async () => {
    jest.clearAllMocks();
    const m: TestingModule = await Test.createTestingModule({
      providers: [
        LikePostUseCase,
        { provide: PostRepository, useValue: postRepo },
        { provide: PostLikeRepository, useValue: likeRepo },
      ],
    }).compile();
    useCase = m.get(LikePostUseCase);
  });

  it('throws if post not found', async () => {
    postRepo.findById.mockResolvedValue(null);
    await expect(useCase.execute('id1', 'u1')).rejects.toThrow(NotFoundException);
  });

  it('adds like', async () => {
    postRepo.findById.mockResolvedValue(
      Post.create({
        authorId: 'a1',
        message: 'm',
        imageUrls: [],
      }),
    );
    const r = await useCase.execute('p1', 'u1');
    expect(r).toEqual({ liked: true });
    expect(likeRepo.addLike).toHaveBeenCalledWith('u1', 'p1');
  });
});
