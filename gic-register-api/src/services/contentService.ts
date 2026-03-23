import {
  newsPostRepository,
  resourceRepository,
} from '../repositories';
import { NotFoundError, ForbiddenError, getPaginationMeta } from '../utils';
import { NewsVisibility, ResourceType, Role } from '../types';

export const contentService = {
  // ─── NEWS POSTS ───────────────────────────────────────────────────────

  async createNewsPost(data: {
    title: string;
    content: string;
    visibility: NewsVisibility;
    createdById: string;
  }) {
    return newsPostRepository.create(data);
  },

  async getNewsPost(id: string, userRole?: Role) {
    const post = await newsPostRepository.findById(id);
    if (!post) throw new NotFoundError('News post not found');

    // Enforce visibility — WORKERS_ONLY posts require WORKER role or above
    if (
      post.visibility === 'WORKERS_ONLY' &&
      userRole &&
      userRole === 'MEMBER'
    ) {
      throw new ForbiddenError('This post is only visible to workers');
    }

    return post;
  },

  async getNewsFeed(
    userRole: Role,
    page: number,
    limit: number
  ) {
    // Members only see PUBLIC posts
    const visibility: NewsVisibility | undefined =
      userRole === 'MEMBER' ? 'PUBLIC' : undefined;

    const { posts, total } = await newsPostRepository.findAll(page, limit, visibility);
    return {
      data: posts,
      pagination: getPaginationMeta(page, limit, total),
    };
  },

  async updateNewsPost(id: string, data: {
    title?: string;
    content?: string;
    visibility?: NewsVisibility;
  }) {
    const post = await newsPostRepository.findById(id);
    if (!post) throw new NotFoundError('News post not found');
    return newsPostRepository.update(id, data);
  },

  async deleteNewsPost(id: string) {
    const post = await newsPostRepository.findById(id);
    if (!post) throw new NotFoundError('News post not found');
    return newsPostRepository.delete(id);
  },

  // ─── RESOURCES ────────────────────────────────────────────────────────

  async createResource(data: {
    type: ResourceType;
    title: string;
    description?: string;
    fileUrl?: string;
    price?: number | null;
    excerpt?: string;
    coverUrl?: string;
  }) {
    return resourceRepository.create(data);
  },

  async getResource(id: string) {
    const resource = await resourceRepository.findById(id);
    if (!resource) throw new NotFoundError('Resource not found');

    // For paid books, strip the fileUrl — only show excerpt
    if (resource.type === 'BOOK' && resource.price && resource.price > 0) {
      return {
        ...resource,
        fileUrl: null,
      };
    }

    return resource;
  },

  async getResources(page: number, limit: number, type?: ResourceType) {
    const { resources, total } = await resourceRepository.findAll(page, limit, type);

    // Strip fileUrl from paid books in list view
    const sanitized = resources.map((r) => {
      if (r.type === 'BOOK' && r.price && r.price > 0) {
        return { ...r, fileUrl: null };
      }
      return r;
    });

    return {
      data: sanitized,
      pagination: getPaginationMeta(page, limit, total),
    };
  },

  async updateResource(id: string, data: {
    title?: string;
    description?: string | null;
    fileUrl?: string | null;
    price?: number | null;
    excerpt?: string | null;
    coverUrl?: string | null;
  }) {
    const resource = await resourceRepository.findById(id);
    if (!resource) throw new NotFoundError('Resource not found');
    return resourceRepository.update(id, data);
  },

  async deleteResource(id: string) {
    const resource = await resourceRepository.findById(id);
    if (!resource) throw new NotFoundError('Resource not found');
    return resourceRepository.delete(id);
  },
};
