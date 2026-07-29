import type { BlogNavItem } from '../../types/blog'
import Icon from '../ui/Icon'

interface BlogNavbarProps {
  readonly navItems: ReadonlyArray<BlogNavItem>
  readonly onSearch?: () => void
  readonly onCartOpen?: () => void
  readonly onAccountOpen?: () => void
}

export default function BlogNavbar({
  navItems,
  onSearch,
  onCartOpen,
  onAccountOpen,
}: BlogNavbarProps) {
  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 md:px-12 h-20 bg-[#F8F8F6] border-b border-[#E2E2DE]"
      aria-label="Main navigation"
    >
      <div className="flex items-center gap-12">
        <a
          href="/"
          className="text-2xl font-bold tracking-tight text-[#111110] font-serif"
          aria-label="Frames 41 home"
        >
          Frames 41
        </a>

        <ul className="hidden md:flex gap-8 list-none m-0 p-0" role="menubar">
          {navItems.map(({ label, href, isActive }) => (
            <li key={label} role="none">
              <a
                role="menuitem"
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={
                  isActive
                    ? 'font-serif text-[14px] tracking-wide text-[#111110] border-b-2 border-primary pb-1'
                    : 'font-serif text-[14px] tracking-wide text-[#8A8A85] hover:text-[#111110] transition-colors duration-300'
                }
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex items-center gap-6">
        <button
          type="button"
          onClick={onSearch}
          aria-label="Search"
          className="text-[#111110] scale-95 active:opacity-80 transition-transform"
        >
          <Icon name="search" />
        </button>
        <button
          type="button"
          onClick={onCartOpen}
          aria-label="Open cart"
          className="text-[#111110] scale-95 active:opacity-80 transition-transform"
        >
          <Icon name="shopping_bag" />
        </button>
        <button
          type="button"
          onClick={onAccountOpen}
          aria-label="Open account"
          className="text-[#111110] scale-95 active:opacity-80 transition-transform"
        >
          <Icon name="person" />
        </button>
      </div>
    </nav>
  )
}
