export interface NavLink {
  readonly label: string
  readonly href: string
}

export interface Category {
  readonly id: string
  readonly title: string
  readonly description?: string
  readonly cta: string
  readonly imageUrl: string
  readonly imageAlt: string
  readonly span: 'wide' | 'narrow'
}

export interface Product {
  readonly id: string
  readonly slug: string
  readonly name: string
  readonly priceInr: number
  readonly originalPriceInr?: number
  readonly imageUrl: string
  readonly imageAlt: string
  readonly badge?: string
  readonly description?: string
  readonly hasOptions?: boolean
}

export interface CategoryProductSection {
  readonly id: string
  readonly slug: string
  readonly title: string
  readonly products: ReadonlyArray<Product>
}

export interface FooterLink {
  readonly label: string
  readonly href: string
}

export interface FooterColumn {
  readonly heading: string
  readonly links: ReadonlyArray<FooterLink>
}

export interface SocialLink {
  readonly icon: string
  readonly href: string
  readonly label: string
}

export interface Banner {
  readonly id: string
  readonly type: string
  readonly title?: string
  readonly subtitle?: string
  readonly imageUrl: string
  readonly mobileImageUrl?: string
  readonly link?: string
  readonly sortOrder: number
  readonly isActive: boolean
  readonly startDate?: string
  readonly endDate?: string
}
