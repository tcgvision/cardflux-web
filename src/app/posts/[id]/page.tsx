'use client'

import { api } from "~/trpc/react";
import { useParams } from "next/navigation";

export default function Post() {
  const params = useParams();
  const id = Number(params.id);

  // Use the `getPost` query from the TRPC client
  const { data: post, isLoading, error } = api.post.getPost.useQuery({ id });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-red-500">Error: {error.message}</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Post not found</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col max-w-2xl mx-auto mt-8">
      <article className="w-full max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl">
          {post.title}
        </h1>
        <p className="text-sm sm:text-base">
          by {post.author?.name ?? 'Unknown Author'}
        </p>
        <div className="prose prose-gray prose-sm sm:prose-base lg:prose-lg mt-4 sm:mt-8">
          {post.content ?? 'No content available.'}
        </div>
      </article>
    </div>
  );
}