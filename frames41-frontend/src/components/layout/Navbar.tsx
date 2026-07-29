import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type { NavLink } from '../../types/home'
import Icon from '../ui/Icon'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { api } from '../../lib/api'
import { adaptProductListing } from '../../lib/adapters'
import { formatINR } from '../../utils/format'
import type { ProductListingProduct } from '../../types/productListing'
import { getProductHref } from '@/utils/productListing'

interface NavbarProps {
  links: ReadonlyArray<NavLink>
  cartCount?: number
  onSearch?: (query: string) => void
  onCartOpen?: () => void
  onProfileOpen?: () => void
}

function normalizeApiResponse(res: unknown): unknown[] {
  if (Array.isArray(res)) return res
  if (res && typeof res === 'object') {
    const obj = res as Record<string, unknown>
    if (Array.isArray(obj.products)) return obj.products
    if (Array.isArray(obj.data)) return obj.data
  }
  return []
}

export default function Navbar({
  links,
  onCartOpen,
  onProfileOpen,
}: NavbarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProductListingProduct[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { itemCount } = useCart()
  const { isAuthenticated } = useAuth()
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Debounced search
  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed || trimmed.length < 2) {
      setResults([])
      setShowDropdown(false)
      setHasSearched(false)
      return
    }

    const timer = setTimeout(() => {
      setIsSearching(true)
      setHasSearched(false)
      api.products
        .searchProducts(trimmed, { limit: 10 })
        .then((res: unknown) => {
          const raw = normalizeApiResponse(res)
          const products = raw.map(adaptProductListing)
          setResults(products)
          setShowDropdown(true)
          setHasSearched(true)
        })
        .catch(() => {
          setResults([])
          setShowDropdown(true)
          setHasSearched(true)
        })
        .finally(() => setIsSearching(false))
    }, 200)

    return () => clearTimeout(timer)
  }, [query])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowDropdown(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed.length >= 2) {
      setShowDropdown(true)
      // Refetch with higher limit when pressing Enter
      setIsSearching(true)
      api.products
        .searchProducts(trimmed, { limit: 20 })
        .then((res: unknown) => {
          const raw = normalizeApiResponse(res)
          setResults(raw.map(adaptProductListing))
          setShowDropdown(true)
        })
        .catch(() => {
          setResults([])
          setShowDropdown(true)
        })
        .finally(() => setIsSearching(false))
    }
  }

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value.slice(0, 100))
  }

  const handleProductClick = useCallback(
    (slug: string) => {
      setShowDropdown(false)
      setQuery('')
      navigate(getProductHref(slug))
    },
    [navigate],
  )

  const handleProfileClick = () => {
    if (onProfileOpen) {
      onProfileOpen()
      return
    }
    navigate(isAuthenticated ? '/profile' : '/checkout')
  }

  const handleCartClick = () => {
    if (onCartOpen) {
      onCartOpen()
      return
    }
    navigate('/cart')
  }

  const dropdownVisible = showDropdown && query.trim().length >= 2
  const isLinkActive = (href: string) =>
    pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))

  return (
    <nav
      aria-label="Main navigation"
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-on-background/10"
    >
      <div className="mx-auto flex w-full max-w-container flex-wrap items-center justify-between gap-y-4 px-4 py-4 sm:flex-nowrap sm:gap-y-0 sm:px-6 sm:py-5">
        <div className="flex items-center gap-12">
          <Link
            to="/"
            aria-label="Frames 41 home"
            className="font-swiss text-3xl font-semibold tracking-tight"
          >
            Frames 41
          </Link>

          <ul className="hidden md:flex gap-8 list-none m-0 p-0" role="list">
            {links.map(({ label, href }) => {
              const active = isLinkActive(href)

              return (
                <li key={href}>
                  <Link
                    to={href}
                    aria-current={active ? 'page' : undefined}
                    className={`text-label-bold uppercase tracking-widest transition-colors ${
                      active
                        ? 'text-primary'
                        : 'text-on-background/60 hover:text-primary'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>

          <div
            ref={searchRef}
            className="relative order-3 w-full sm:order-none sm:ml-auto sm:w-auto"
          >
            <form onSubmit={handleSearchSubmit} role="search">
              <label htmlFor="site-search" className="sr-only">
                Search products
              </label>
              <Icon
                name="search"
                className="absolute left-3 top-1/2 -translate-y-1/2 text-on-background/40 text-sm pointer-events-none"
              />
              <input
                ref={inputRef}
                id="site-search"
                type="search"
                value={query}
                onChange={handleQueryChange}
                onFocus={() => {
                  if (query.trim().length >= 2) setShowDropdown(true)
                }}
                placeholder="Search products..."
                autoComplete="off"
                className="w-full rounded-full border border-on-background/10 bg-on-background/5 py-2 pl-10 pr-4 text-sm outline-none transition-all focus:border-primary focus:ring-1 focus:ring-primary sm:w-64 lg:w-80"
              />
            </form>

            {/* Autocomplete dropdown */}
            {dropdownVisible && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background rounded-xl shadow-xl border border-on-background/10 overflow-hidden z-50 min-w-[16rem]">
                {isSearching ? (
                  <div className="flex items-center justify-center py-6 gap-2">
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm text-on-background/60">Searching...</span>
                  </div>
                ) : results.length === 0 && hasSearched ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-sm text-on-background/60">
                      No products found for "{query.trim()}"
                    </p>
                  </div>
                ) : (
                  <ul className="max-h-96 overflow-y-auto divide-y divide-on-background/5">
                    {results.map((product) => (
                      <li key={product.id}>
                        <button
                          type="button"
                          onClick={() => handleProductClick(product.slug)}
                          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-on-background/5 transition-colors text-left"
                        >
                          <div className="w-12 h-12 rounded-lg bg-on-background/5 overflow-hidden shrink-0 flex items-center justify-center">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.imageAlt}
                                className="w-full h-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <Icon name="image" className="text-on-background/20" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-on-background truncate">
                              {product.name}
                            </p>
                            <p className="text-xs text-on-background/60 mt-0.5">
                              {formatINR(product.priceInr)}
                            </p>
                          </div>
                          <Icon
                            name="arrow_forward_ios"
                            className="text-xs text-on-background/20 shrink-0"
                          />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 sm:ml-6">
            <button
              type="button"
              onClick={handleProfileClick}
              aria-label="My account"
              className="hover:text-primary transition-colors"
            >
              <Icon name="person" />
            </button>

            <button
              type="button"
              onClick={handleCartClick}
              aria-label={`Shopping cart – ${itemCount} item${itemCount !== 1 ? 's' : ''}`}
              className="relative hover:text-primary transition-colors"
            >
              <Icon name="shopping_cart" />
              {itemCount > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                >
                  {itemCount}
                </span>
              )}
            </button>
        </div>
      </div>
    </nav>
  )
}
