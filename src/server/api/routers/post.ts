import { protectedProcedure, publicProcedure, createTRPCRouter } from "~/server/api/trpc";
import { db } from "~/server/db";
import { z } from "zod";

/**
 * Post Router Documentation
 * 
 * This router demonstrates how to create tRPC endpoints with both public and protected routes.
 * 
 * Key Concepts:
 * 1. Schema Validation: Use Zod to validate input data
 * 2. Procedure Types:
 *    - publicProcedure: Accessible by anyone
 *    - protectedProcedure: Only accessible by authenticated users
 * 3. Context Usage: Access database and auth through ctx
 * 
 * Usage Example:
 * ```typescript
 * // Client-side usage
 * const posts = await api.post.getPosts.query();
 * const newPost = await api.post.createPost.mutate({
 *   title: "My Post",
 *   content: "Content here",
 * });
 * ```
 */

// Input validation schemas
const postSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
});

const postIdSchema = z.object({
  id: z.string(),
});

export const postRouter = createTRPCRouter({
  /**
   * Get a single post by ID
   * Public endpoint - anyone can access
   */
  getPost: publicProcedure
    .input(postIdSchema)
    .query(async ({ input }) => {
      return await db.post.findUnique({
        where: { id: input.id },
        include: {
          author: true, // Include author details
        },
      });
    }),

  /**
   * Get all posts
   * Public endpoint - anyone can access
   */
  getPosts: publicProcedure.query(async () => {
    return await db.post.findMany({
      include: {
        author: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }),

  /**
   * Create a new post
   * Protected endpoint - only authenticated users can access
   * Automatically uses the authenticated user's ID
   */
  createPost: protectedProcedure
    .input(postSchema)
    .mutation(async ({ ctx, input }) => {
      // ctx.auth.userId is guaranteed to exist in protected procedures
      return await db.post.create({
        data: {
          title: input.title,
          content: input.content,
          authorId: ctx.auth.userId, // Use the authenticated user's ID
        },
        include: {
          author: true,
        },
      });
    }),

  /**
   * Update an existing post
   * Protected endpoint - only authenticated users can access
   * Only allows updating own posts
   */
  updatePost: protectedProcedure
    .input(z.object({
      id: z.string(),
      data: postSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      // First verify the post belongs to the user
      const post = await db.post.findUnique({
        where: { id: input.id },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      if (post.authorId !== ctx.auth.userId) {
        throw new Error("Not authorized to update this post");
      }

      return await db.post.update({
        where: { id: input.id },
        data: input.data,
        include: {
          author: true,
        },
      });
    }),

  /**
   * Delete a post
   * Protected endpoint - only authenticated users can access
   * Only allows deleting own posts
   */
  deletePost: protectedProcedure
    .input(postIdSchema)
    .mutation(async ({ ctx, input }) => {
      // First verify the post belongs to the user
      const post = await db.post.findUnique({
        where: { id: input.id },
      });

      if (!post) {
        throw new Error("Post not found");
      }

      if (post.authorId !== ctx.auth.userId) {
        throw new Error("Not authorized to delete this post");
      }

      return await db.post.delete({
        where: { id: input.id },
      });
    }),
});

export type PostRouter = typeof postRouter;