export type FaqCategoryId = 'all' | 'orders' | 'shipping' | 'customization' | 'sustainability'

export type FilterableCategoryId = Exclude<FaqCategoryId, 'all'>

export interface FaqItem {
  readonly id: string
  readonly question: string
  readonly answer: string
  readonly categoryId: FilterableCategoryId
}

export interface FaqCategory {
  readonly id: FaqCategoryId
  readonly label: string
}

export interface FaqCategoryGroup {
  readonly id: FilterableCategoryId
  readonly heading: string
  readonly items: ReadonlyArray<FaqItem>
}

export interface FaqSidebarConfig {
  readonly workshopImageUrl: string
  readonly workshopImageAlt: string
  readonly conciergeHref: string
}

export interface FaqProps {
  readonly categories?: ReadonlyArray<FaqCategory>
  readonly items?: ReadonlyArray<FaqItem>
  readonly sidebar?: FaqSidebarConfig
  readonly onContactSupport?: () => void
  readonly onConciergeContact?: () => void
}
