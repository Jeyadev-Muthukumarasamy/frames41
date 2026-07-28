export interface WishlistItem {
  readonly id: string
  readonly name: string
  readonly material: string
  readonly priceInr: number
  readonly imageUrl: string
  readonly imageAlt: string
}

export interface WishlistBanner {
  readonly imageUrl: string
  readonly imageAlt: string
  readonly title: string
  readonly body: string
  readonly linkHref: string
  readonly linkLabel: string
}

export interface WishlistData {
  readonly items: ReadonlyArray<WishlistItem>
  readonly banner: WishlistBanner
}
