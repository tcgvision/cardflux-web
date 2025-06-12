'use client'

import { useRouter } from 'next/navigation'
import { SignInButton, useAuth } from '@clerk/nextjs'
import { api } from "~/trpc/react"
import { useState } from 'react'

export default function NewPost() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const { userId, isLoaded } = useAuth()
  
  // Use the createPost mutation from the TRPC client
  const createPostMutation = api.post.createPost.useMutation({
    onSuccess: () => {
      router.push('/')
      router.refresh()
    },
    onError: (error) => {
      console.error('Failed to create post:', error)
      // You might want to show an error message to the user here
    },
  })

  // Check if Clerk is loaded
  if (!isLoaded) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center space-y-4">
        <div>Loading...</div>
      </div>
    )
  }

  // Protect this page from unauthenticated users
  if (!userId) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center space-y-4">
        <p>You must be signed in to create a post.</p>
        <SignInButton>
          <button
            type="button"
            className="inline-block cursor-pointer rounded-lg border-2 border-current px-4 py-2 text-current transition-all hover:scale-[0.98]"
          >
            Sign in
          </button>
        </SignInButton>
      </div>
    )
  }

  // Handle form submission
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (!title.trim()) {
      // You might want to show an error message to the user here
      return
    }

    createPostMutation.mutate({
      title: title.trim(),
      content: content.trim(),
    })
  }

  return (
    <div className="mx-auto max-w-2xl p-4">
      <h1 className="mb-6 text-2xl font-bold">Create New Post</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="mb-2 block text-lg">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your post title"
            className="w-full rounded-lg border px-4 py-2"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="mb-2 block text-lg">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your post content here..."
            rows={6}
            className="w-full rounded-lg border px-4 py-2"
          />
        </div>
        <button
          type="submit"
          disabled={createPostMutation.isPending}
          className="inline-block w-full rounded-lg border-2 border-current px-4 py-2 text-current transition-all hover:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createPostMutation.isPending ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  )
}