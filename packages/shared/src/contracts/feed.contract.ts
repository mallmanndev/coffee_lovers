import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  addCommentInputSchema,
  createPostInputSchema,
  createPostOutputSchema,
  feedCommentListResponseSchema,
  feedPostListResponseSchema,
  likeStateSchema,
  updatePostInputSchema,
} from '../schemas/feed.schema';

const c = initContract();

const err = z.object({ message: z.string() });

const authErr = { 401: err } as const;

export const feedContract = c.router({
  createPost: {
    method: 'POST',
    path: '/feed/posts',
    body: createPostInputSchema,
    responses: {
      201: createPostOutputSchema,
      400: err,
      ...authErr,
    },
    summary: 'Cria um post no feed',
  },
  listPosts: {
    method: 'GET',
    path: '/feed/posts',
    query: z.object({
      limit: z.coerce.number().int().min(1).max(50).optional(),
      cursor: z.string().optional(),
    }),
    responses: {
      200: feedPostListResponseSchema,
      400: err,
      ...authErr,
    },
    summary: 'Lista o feed (paginado por cursor)',
  },
  deletePost: {
    method: 'DELETE',
    path: '/feed/posts/:id',
    body: z.object({}),
    responses: {
      204: z.null(),
      403: err,
      404: err,
      ...authErr,
    },
    summary: 'Remove o próprio post do feed',
  },
  updatePost: {
    method: 'PATCH',
    path: '/feed/posts/:id',
    body: updatePostInputSchema,
    responses: {
      200: createPostOutputSchema,
      400: err,
      403: err,
      404: err,
      ...authErr,
    },
    summary: 'Atualiza o próprio post no feed',
  },
  likePost: {
    method: 'POST',
    path: '/feed/posts/:id/like',
    body: z.object({}),
    responses: {
      200: likeStateSchema,
      404: err,
      ...authErr,
    },
    summary: 'Registra uma curtida (idempotente se já existir)',
  },
  unlikePost: {
    method: 'DELETE',
    path: '/feed/posts/:id/like',
    body: z.object({}),
    responses: {
      200: likeStateSchema,
      404: err,
      ...authErr,
    },
    summary: 'Remove a curtida do usuário autenticado no post',
  },
  addComment: {
    method: 'POST',
    path: '/feed/posts/:id/comments',
    body: addCommentInputSchema,
    responses: {
      201: z.object({ id: z.string() }),
      400: err,
      404: err,
      ...authErr,
    },
    summary: 'Adiciona um comentário ao post',
  },
  listComments: {
    method: 'GET',
    path: '/feed/posts/:id/comments',
    query: z.object({
      limit: z.coerce.number().int().min(1).max(100).optional(),
      cursor: z.string().optional(),
    }),
    responses: {
      200: feedCommentListResponseSchema,
      400: err,
      404: err,
      ...authErr,
    },
    summary: 'Lista comentários do post (cursor)',
  },
  deleteComment: {
    method: 'DELETE',
    path: '/feed/posts/:postId/comments/:commentId',
    body: z.object({}),
    responses: {
      204: z.null(),
      403: err,
      404: err,
      ...authErr,
    },
    summary: 'Remove o próprio comentário',
  },
});
