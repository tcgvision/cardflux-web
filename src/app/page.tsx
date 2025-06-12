import Link from "next/link";
import { api } from "~/trpc/server";
// import type { Post } from "@prisma/client";

export default async function Home() {
  const posts = await api.post.getPosts();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
          TCG Vision (testing)
        </h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 hover:bg-white/20"
            >
              <h3 className="text-2xl font-bold">{post.title}</h3>
              <div className="text-lg">{post.content}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
