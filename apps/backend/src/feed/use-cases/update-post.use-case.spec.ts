import {
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Post } from '../domain/post.entity';
import { PostRepository } from '../repositories/post.repository';
import { FEED_DAO } from '../daos/feed.dao';
import { UpdatePostUseCase } from './update-post.use-case';
import type { UpdatePostInput } from '@coffee-lovers/shared';

describe('UpdatePostUseCase', () => {
  let useCase: UpdatePostUseCase;
  const mockPostRepo = {
    findById: jest.fn(),
    findByIdAndAuthorId: jest.fn(),
    update: jest.fn().mockImplementation((post: Post) => Promise.resolve(post)),
  };
  const mockFeedDao = {
    getPostItemById: jest.fn().mockResolvedValue({
      id: 'post-1',
      message: 'updated',
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

  const existingUserPost = Post.create({
    id: 'post-1',
    authorId: 'u1',
    message: 'old',
    imageUrls: [],
    kind: 'user',
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePostUseCase,
        { provide: PostRepository, useValue: mockPostRepo },
        { provide: FEED_DAO, useValue: mockFeedDao },
      ],
    }).compile();
    useCase = module.get(UpdatePostUseCase);
  });

  it('throws NotFoundException when post does not exist', async () => {
    mockPostRepo.findByIdAndAuthorId.mockResolvedValue(null);
    mockPostRepo.findById.mockResolvedValue(null);
    const input: UpdatePostInput = { message: 'x', imageUrls: [] };
    await expect(useCase.execute('missing', input, 'u1')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('throws ForbiddenException when post exists but user is not author', async () => {
    mockPostRepo.findByIdAndAuthorId.mockResolvedValue(null);
    mockPostRepo.findById.mockResolvedValue(existingUserPost);
    const input: UpdatePostInput = { message: 'x', imageUrls: [] };
    await expect(useCase.execute('post-1', input, 'other')).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('updates and returns feed item for author', async () => {
    mockPostRepo.findByIdAndAuthorId.mockResolvedValue(existingUserPost);
    const input: UpdatePostInput = { message: 'new text', imageUrls: [] };
    const r = await useCase.execute('post-1', input, 'u1');
    expect(r.message).toBe('updated');
    expect(mockPostRepo.update).toHaveBeenCalled();
    expect(mockFeedDao.getPostItemById).toHaveBeenCalledWith('post-1', 'u1');
  });
});
