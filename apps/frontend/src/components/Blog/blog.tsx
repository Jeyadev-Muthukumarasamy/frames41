import {
  BLOG_FOOTER_LINKS,
  BLOG_NAV_ITEMS,
  BLOG_POST_DEFAULTS,
  BLOG_RELATED_STORIES,
  BLOG_SHARE_LINKS,
} from '../../constants/blog'
import type { BlogProps } from '../../types/blog'
import BlogArticleBody from './BlogArticleBody'
import BlogFeatureImage from './BlogFeatureImage'
import BlogFooter from './BlogFooter'
import BlogHero from './BlogHero'
import BlogNavbar from './BlogNavbar'
import BlogRelatedStories from './BlogRelatedStories'

export default function Blog({
  post = BLOG_POST_DEFAULTS,
  shareLinks = BLOG_SHARE_LINKS,
  relatedStories = BLOG_RELATED_STORIES,
  navItems = BLOG_NAV_ITEMS,
  footerLinks = BLOG_FOOTER_LINKS,
  onSearch,
  onCartOpen,
  onAccountOpen,
  onViewJournal,
}: BlogProps) {
  return (
    <>
      <BlogNavbar
        navItems={navItems}
        onSearch={onSearch}
        onCartOpen={onCartOpen}
        onAccountOpen={onAccountOpen}
      />

      <main className="pt-20">
        <BlogHero title={post.title} meta={post.meta} />
        <BlogFeatureImage image={post.featureImage} />
        <BlogArticleBody sections={post.sections} tags={post.tags} shareLinks={shareLinks} />
        <BlogRelatedStories stories={relatedStories} onViewJournal={onViewJournal} />
      </main>

      <BlogFooter links={footerLinks} />
    </>
  )
}
