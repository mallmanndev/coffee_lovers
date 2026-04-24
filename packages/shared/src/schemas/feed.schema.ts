import { z } from 'zod';

const maxMessageLength = 5000;
const maxImageUrls = 10;
const maxCommentLength = 2000;
const uploadUrlRegex = /^\/uploads\/.+/;

const feedPostKind = z.enum(['user', 'equipment_share']);

export const createPostInputSchema = z.object({
  message: z.string().min(1).max(maxMessageLength),
  imageUrls: z
    .array(
      z
        .string()
        .regex(
          uploadUrlRegex,
          'Cada imagem deve ser uma URL com prefixo /uploads/',
        ),
    )
    .max(maxImageUrls)
    .default([]),
  kind: feedPostKind.optional().default('user'),
  userEquipamentId: z.string().min(1).optional(),
  shareSummary: z.string().max(500).optional(),
});

export const feedPostAuthorSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const feedPostItemSchema = z.object({
  id: z.string(),
  message: z.string(),
  imageUrls: z.array(z.string()),
  author: feedPostAuthorSchema,
  likeCount: z.number().int().nonnegative(),
  commentCount: z.number().int().nonnegative(),
  likedByMe: z.boolean(),
  kind: feedPostKind,
  userEquipamentId: z.string().optional(),
  shareSummary: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const feedPostListResponseSchema = z.object({
  items: z.array(feedPostItemSchema),
  nextCursor: z.string().nullable(),
});

export const addCommentInputSchema = z.object({
  message: z
    .string()
    .min(1, 'Mensagem obrigatória')
    .max(maxCommentLength, 'Mensagem muito longa'),
});

export const feedCommentItemSchema = z.object({
  id: z.string(),
  message: z.string(),
  author: feedPostAuthorSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const feedCommentListResponseSchema = z.object({
  items: z.array(feedCommentItemSchema),
  nextCursor: z.string().nullable(),
});

export const createPostOutputSchema = feedPostItemSchema;
export const likeStateSchema = z.object({ liked: z.boolean() });

export type CreatePostInput = z.infer<typeof createPostInputSchema>;
export type FeedPostItem = z.infer<typeof feedPostItemSchema>;
export type FeedPostListResponse = z.infer<typeof feedPostListResponseSchema>;
export type AddCommentInput = z.infer<typeof addCommentInputSchema>;
export type FeedCommentItem = z.infer<typeof feedCommentItemSchema>;
export type FeedCommentListResponse = z.infer<typeof feedCommentListResponseSchema>;
export type CreatePostOutput = z.infer<typeof createPostOutputSchema>;
