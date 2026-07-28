export interface BlogAuthor {
  readonly name: string
  readonly href?: string
}

export interface BlogMeta {
  readonly category: string
  readonly author: BlogAuthor
  readonly publishedAt: string
  readonly readTimeMinutes: number
}

export interface BlogImage {
  readonly src: string
  readonly alt: string
}

export type BlogSectionType =
  | 'lead-quote'
  | 'paragraph'
  | 'heading'
  | 'pull-block'
  | 'image-grid'

export interface BlogSection {
  readonly id: string
  readonly type: BlogSectionType
  readonly content?: string
  readonly attribution?: string
  readonly images?: ReadonlyArray<BlogImage>
}

export interface BlogTag {
  readonly label: string
}

export interface BlogShareLink {
  readonly label: string
  readonly href: string
  readonly rel?: string
}

export interface BlogNavItem {
  readonly label: string
  readonly href: string
  readonly isActive?: boolean
}

export interface RelatedStory {
  readonly id: string
  readonly category: string
  readonly title: string
  readonly image: BlogImage
  readonly href: string
}

export interface BlogFooterLink {
  readonly label: string
  readonly href: string
}

export interface BlogPost {
  readonly title: string
  readonly meta: BlogMeta
  readonly featureImage: BlogImage
  readonly sections: ReadonlyArray<BlogSection>
  readonly tags: ReadonlyArray<BlogTag>
}

export interface BlogProps {
  readonly post?: BlogPost
  readonly shareLinks?: ReadonlyArray<BlogShareLink>
  readonly relatedStories?: ReadonlyArray<RelatedStory>
  readonly navItems?: ReadonlyArray<BlogNavItem>
  readonly footerLinks?: ReadonlyArray<BlogFooterLink>
  readonly onSearch?: () => void
  readonly onCartOpen?: () => void
  readonly onAccountOpen?: () => void
  readonly onViewJournal?: () => void
}
