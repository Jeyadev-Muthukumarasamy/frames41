interface WishlistHeaderProps {
  count: number
}

export default function WishlistHeader({ count }: WishlistHeaderProps) {
  const subtitle =
    count === 0
      ? 'Your wishlist is empty.'
      : `Items curated for your unique expression. (${count} ${count === 1 ? 'Item' : 'Items'} Saved)`

  return (
    <header className="mb-12">
      <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">My Wishlist</h1>
      <p
        className="font-body-md text-secondary text-body-md"
        aria-live="polite"
        aria-atomic="true"
      >
        {subtitle}
      </p>
    </header>
  )
}
