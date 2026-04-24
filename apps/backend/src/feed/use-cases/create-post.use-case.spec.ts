import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { User } from '../../users/domain/user.entity';
import { UserRepository } from '../../users/repositories/user.repository';
import { Post } from '../domain/post.entity';
import { PostRepository } from '../repositories/post.repository';
import { FEED_DAO } from '../daos/feed.dao';
import { CreatePostUseCase } from './create-post.use-case';
import type { CreatePostInput } from '@coffee-lovers/shared';

describe('CreatePostUseCase', () => {
  let useCase: CreatePostUseCase;
  const mockUserRepo = { findById: jest.fn() };
  const mockPostRepo = {
    create: jest.fn().mockImplementation((post: Post) =>
      Promise.resolve(
        Post.create({
          id: 'post-new-id',
          authorId: post.getAuthorId(),
          message: post.getMessage(),
          imageUrls: post.getImageUrls(),
          kind: post.getKind(),
          userEquipamentId: post.getUserEquipamentId() ?? undefined,
          shareSummary: post.getShareSummary() ?? undefined,
        }),
      ),
    ),
  };
  const mockFeedDao = {
    getPostItemById: jest.fn().mockResolvedValue({
      id: 'post-new-id',
      message: 'm',
      imageUrls: [],
      author: { id: 'u1', name: 'A' },
      likeCount: 0,
      commentCount: 0,
      likedByMe: false,
      kind: 'user' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreatePostUseCase,
        { provide: UserRepository, useValue: mockUserRepo },
        { provide: PostRepository, useValue: mockPostRepo },
        { provide: FEED_DAO, useValue: mockFeedDao },
      ],
    }).compile();
    useCase = module.get(CreatePostUseCase);
  });

  it('throws when user does not exist', async () => {
    mockUserRepo.findById.mockResolvedValue(null);
    const input: CreatePostInput = {
      message: 'x',
      imageUrls: [],
      kind: 'user',
    };
    await expect(useCase.execute(input, 'nope')).rejects.toThrow(NotFoundException);
  });

  it('creates post and returns feed item', async () => {
    const u = User.create({
      name: 'A',
      id: '507f1f77bcf86cd799439012',
      email: 'a@a.com',
      passwordHash: 'h',
      city: 'C',
      state: 'S',
    });
    mockUserRepo.findById.mockResolvedValue(u);
    const input: CreatePostInput = { message: 'm', imageUrls: [], kind: 'user' };
    const r = await useCase.execute(
      input,
      '507f1f77bcf86cd799439012',
    );
    expect(r.id).toBe('post-new-id');
    expect(r.author.name).toBe('A');
    expect(mockPostRepo.create).toHaveBeenCalled();
    expect(mockFeedDao.getPostItemById).toHaveBeenCalledWith('post-new-id', '507f1f77bcf86cd799439012');
  });
});
