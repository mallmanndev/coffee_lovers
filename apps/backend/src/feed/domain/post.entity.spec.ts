import { BadRequestException } from '@nestjs/common';
import { Post, PostProps } from './post.entity';

const userInput = (over?: Partial<PostProps>): PostProps => ({
  authorId: '507f1f77bcf86cd799439011',
  message: '  Hello  ',
  imageUrls: [],
  kind: 'user',
  ...over,
});

describe('Post entity', () => {
  it('creates with trimmed message and optional images', () => {
    const p = Post.create(
      userInput({ imageUrls: ['/uploads/a.png', '/uploads/b.webp'] }),
    );
    expect(p.getMessage()).toBe('Hello');
    expect(p.getImageUrls()).toEqual(['/uploads/a.png', '/uploads/b.webp']);
    expect(p.getKind()).toBe('user');
  });

  it('rejects bad image path', () => {
    expect(() => Post.create(userInput({ imageUrls: ['https://x.com/a.png'] }))).toThrow(
      BadRequestException,
    );
  });

  it('rejects user kind with share fields', () => {
    expect(() =>
      Post.create(
        userInput({
          kind: 'user',
          userEquipamentId: 'u1',
        } as PostProps),
      ),
    ).toThrow(BadRequestException);
  });

  it('requires userEquipamentId for equipment_share', () => {
    expect(() => Post.create(userInput({ kind: 'equipment_share' }))).toThrow(
      BadRequestException,
    );
  });

  it('creates equipment_share with userEquipamentId', () => {
    const p = Post.create(
      userInput({
        kind: 'equipment_share',
        userEquipamentId: '  ue-1  ',
        shareSummary: ' Nova máquina ',
      }),
    );
    expect(p.getUserEquipamentId()).toBe('ue-1');
    expect(p.getShareSummary()).toBe('Nova máquina');
  });
});
