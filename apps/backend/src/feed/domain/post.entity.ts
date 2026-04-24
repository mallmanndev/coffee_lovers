import { BadRequestException } from '@nestjs/common';
import type { CreatePostInput } from '@coffee-lovers/shared';

const maxMessageLength = 5000;
const maxImageUrls = 10;
const uploadPathPattern = /^\/uploads\/.+/;

export type PostKind = 'user' | 'equipment_share';

export type PostProps = {
  id?: string;
  authorId: string;
  message: string;
  imageUrls: string[];
  kind?: PostKind;
  userEquipamentId?: string;
  shareSummary?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export class Post {
  private constructor(
    private readonly id: string | null,
    private readonly authorId: string,
    private readonly message: string,
    private readonly imageUrls: string[],
    private readonly kind: PostKind,
    private readonly userEquipamentId: string | null,
    private readonly shareSummary: string | null,
    private readonly createdAt: Date,
    private readonly updatedAt: Date,
  ) {}

  static createFromInput(input: CreatePostInput, authorId: string): Post {
    return this.create({
      authorId,
      message: input.message,
      imageUrls: input.imageUrls,
      kind: input.kind,
      userEquipamentId: input.userEquipamentId,
      shareSummary: input.shareSummary,
    });
  }

  static create(props: PostProps): Post {
    if (typeof props.authorId !== 'string' || !props.authorId.trim()) {
      throw new BadRequestException('authorId is required');
    }
    this.validateMessage(props.message);
    this.validateImageUrls(props.imageUrls);
    this.validateKindFields(
      props.kind ?? 'user',
      props.userEquipamentId,
      props.shareSummary,
    );
    return new Post(
      props.id || null,
      props.authorId.trim(),
      props.message.trim(),
      [...props.imageUrls],
      props.kind ?? 'user',
      props.userEquipamentId?.trim() || null,
      props.shareSummary?.trim() || null,
      props.createdAt || new Date(),
      props.updatedAt || new Date(),
    );
  }

  private static validateMessage(value: string) {
    if (typeof value !== 'string') {
      throw new BadRequestException('message is required');
    }
    const t = value.trim();
    if (t.length === 0) {
      throw new BadRequestException('message cannot be empty');
    }
    if (t.length > maxMessageLength) {
      throw new BadRequestException('message is too long');
    }
  }

  private static validateImageUrls(urls: string[] | undefined) {
    if (!urls || urls.length === 0) return;
    if (urls.length > maxImageUrls) {
      throw new BadRequestException('too many images');
    }
    for (const u of urls) {
      if (typeof u !== 'string' || !uploadPathPattern.test(u.trim())) {
        throw new BadRequestException('Invalid image URL (expected /uploads/...)');
      }
    }
  }

  private static validateKindFields(
    kind: PostKind,
    userEquipamentId?: string,
    shareSummary?: string,
  ) {
    if (kind === 'equipment_share') {
      if (!userEquipamentId?.trim()) {
        throw new BadRequestException(
          'userEquipamentId is required when kind is equipment_share',
        );
      }
    } else {
      if (userEquipamentId?.trim()) {
        throw new BadRequestException(
          'userEquipamentId is only used when kind is equipment_share',
        );
      }
      if (shareSummary?.trim()) {
        throw new BadRequestException(
          'shareSummary is only used when kind is equipment_share',
        );
      }
    }
  }

  getId(): string | null {
    return this.id;
  }
  getAuthorId(): string {
    return this.authorId;
  }
  getMessage(): string {
    return this.message;
  }
  getImageUrls(): string[] {
    return this.imageUrls;
  }
  getKind(): PostKind {
    return this.kind;
  }
  getUserEquipamentId(): string | null {
    return this.userEquipamentId;
  }
  getShareSummary(): string | null {
    return this.shareSummary;
  }
  getCreatedAt(): Date {
    return this.createdAt;
  }
  getUpdatedAt(): Date {
    return this.updatedAt;
  }
}
