import { z } from 'zod';
import { insertUserSchema, users, movies, favorites } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  auth: {
    register: {
      method: 'POST' as const,
      path: '/api/register',
      input: insertUserSchema,
      responses: {
        201: z.custom<typeof users.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/login',
      input: insertUserSchema,
      responses: {
        200: z.custom<typeof users.$inferSelect>(),
        401: z.object({ message: z.string() }),
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout',
      responses: {
        200: z.void(),
      },
    },
    me: {
      method: 'GET' as const,
      path: '/api/user',
      responses: {
        200: z.custom<typeof users.$inferSelect>(), // Returns user or null/401
      },
    },
  },
  movies: {
    list: {
      method: 'GET' as const,
      path: '/api/movies',
      responses: {
        200: z.array(z.custom<typeof movies.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/movies/:id',
      responses: {
        200: z.custom<typeof movies.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    recommendations: {
      method: 'GET' as const,
      path: '/api/recommendations',
      responses: {
        200: z.array(z.custom<typeof movies.$inferSelect>()),
      },
    },
  },
  favorites: {
    list: {
      method: 'GET' as const,
      path: '/api/favorites',
      responses: {
        200: z.array(z.custom<typeof movies.$inferSelect>()), // Returns movies that are favorited
      },
    },
    toggle: {
      method: 'POST' as const,
      path: '/api/favorites/:movieId',
      responses: {
        200: z.object({ isFavorite: z.boolean() }),
        404: errorSchemas.notFound,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
