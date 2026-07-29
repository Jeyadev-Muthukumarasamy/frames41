import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { BlogPost } from '@/types/blog'

export function useBlog(slug: string) {
  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    api.blog.getBySlug(slug)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .then((raw: any) => {
        setPost({
          title: raw.title ?? '',
          meta: {
            category: 'Journal',
            author: { name: raw.author ?? '' },
            publishedAt: raw.publishedAt ? new Date(raw.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
            readTimeMinutes: 5,
          },
          featureImage: { src: raw.coverImage ?? '', alt: raw.title ?? '' },
          sections: [{ id: '1', type: 'paragraph', content: raw.content ?? '' }],
          tags: (raw.metaDescription ?? '').split(',').filter(Boolean).map((t: string) => ({ label: t.trim() })),
        })
      })
      .catch(() => setError('Post not found'))
      .finally(() => setLoading(false))
  }, [slug])

  return { post, loading, error }
}
