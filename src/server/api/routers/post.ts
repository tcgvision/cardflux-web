import { protectedProcedure, publicProcedure, createTRPCRouter } from "~/server/api/trpc";
import { db } from "~/server/db";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

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
  id: z.number(),
});

export const postRouter = createTRPCRouter({
  /**
   * Get a single post by ID
   * Public endpoint - anyone can access
   */
  getPost: publicProcedure
    .input(postIdSchema)
    .query(async ({ input }) => {
      const post = await db.post.findUnique({
        where: { id: input.id },
        include: {
          author: true,
        },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      return post;
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
   */
  createPost: protectedProcedure
    .input(postSchema)
    .mutation(async ({ ctx, input }) => {
      console.log(ctx)
      if (!ctx.auth.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to create a post",
        });
      }

      // Find the user by their Clerk ID
      const user = await db.user.findUnique({
        where: { clerkId: ctx.auth.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found in database",
        });
      }

      return await db.post.create({
        data: {
          title: input.title,
          content: input.content,
          authorId: user.id, // Use the numeric ID from the database
        },
        include: {
          author: true,
        },
      });
    }),

  /**
   * Update an existing post
   * Protected endpoint - only authenticated users can access
   */
  updatePost: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: postSchema,
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to update a post",
        });
      }

      // Find the user by their Clerk ID
      const user = await db.user.findUnique({
        where: { clerkId: ctx.auth.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found in database",
        });
      }

      const post = await db.post.findUnique({
        where: { id: input.id },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      if (post.authorId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to update this post",
        });
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
   */
  deletePost: protectedProcedure
    .input(postIdSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.auth.userId) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "You must be logged in to delete a post",
        });
      }

      // Find the user by their Clerk ID
      const user = await db.user.findUnique({
        where: { clerkId: ctx.auth.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found in database",
        });
      }

      const post = await db.post.findUnique({
        where: { id: input.id },
      });

      if (!post) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Post not found",
        });
      }

      if (post.authorId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not authorized to delete this post",
        });
      }

      return await db.post.delete({
        where: { id: input.id },
      });
    }),
});

export type PostRouter = typeof postRouter;