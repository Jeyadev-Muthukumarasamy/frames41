import { useParams } from 'react-router-dom'
import { useBlog } from '@/hooks/useBlog'
import Blog from '@/components/blog/Blog'

export default function BlogPage() {
  const { slug = '' } = useParams<{ slug: string }>()
  const { post, loading, error } = useBlog(slug)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#6B6B6B]">{error ?? 'Post not found'}</p>
      </div>
    )
  }

  return <Blog post={post} />
}
