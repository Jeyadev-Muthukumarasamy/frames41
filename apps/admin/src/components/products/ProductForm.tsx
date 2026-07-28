import { useState, useEffect, useRef } from 'react'
import type { AdminProductDetail, ProductFormData, AdminCategory, ProductCustomizationConfig } from '@/types/admin'
import { api } from '@/lib/api'
import { useToast } from '@/hooks/useToast'
import { validateField, type ValidationRule } from '@/lib/validation'
import VariantsEditor from './VariantsEditor'
import PriceTiersEditor from './PriceTiersEditor'

interface Props {
  initial?: AdminProductDetail | null
  categories: AdminCategory[]
  onSubmit: (data: ProductFormData) => Promise<void>
  loading?: boolean
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

const emptyCustomizationConfig = (): ProductCustomizationConfig => ({
  numberOfImages: { enabled: false, count: 1 },
  numberOfNames: { enabled: false, count: 1 },
  date: { enabled: false },
  songName: { enabled: false },
  qrCodeImages: { enabled: false, count: 1 },
  contactShop: { enabled: false, value: '' },
  startingFrom: { enabled: false, amount: undefined },
})

function buildInitial(p?: AdminProductDetail | null): ProductFormData {
  return {
    name: p?.name ?? '',
    slug: p?.slug ?? '',
    sku: p?.sku ?? '',
    description: p?.description ?? '',
    specifications: p?.specifications ?? {},
    careInstructions: p?.careInstructions ?? '',
    basePrice: p?.basePrice ?? 0,
    discountedPrice: p?.discountedPrice,
    stock: p?.stock ?? 0,
    categoryId: p?.categoryId ?? '',
    isActive: p?.isActive ?? true,
    isBestSeller: p?.isBestSeller ?? false,
    isFeatured: p?.isFeatured ?? false,
    imageUrls: p?.imageUrls ?? [],
    variants: p?.variants?.map(({ name, sku, priceModifier, stock, imageUrl }) => ({ name, sku, priceModifier, stock, imageUrl })) ?? [],
    priceTiers: p?.priceTiers?.map(({ minQty, maxQty, pricePerUnit }) => ({ minQty, maxQty, pricePerUnit })) ?? [],
    seoTitle: p?.seoTitle ?? '',
    seoDescription: p?.seoDescription ?? '',
    customizationConfig: p?.customizationConfig ?? emptyCustomizationConfig(),
  }
}

function Field({ label, children, required, error }: { label: string; children: React.ReactNode; required?: boolean; error?: string }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}

function flattenCategories(cats: AdminCategory[], depth = 0): { id: string; label: string }[] {
  return cats.flatMap((c) => [
    { id: c.id, label: `${'  '.repeat(depth)}${c.name}` },
    ...flattenCategories(c.children, depth + 1),
  ])
}

const FIELD_RULES: Record<string, ValidationRule<string | number>> = {
  name: { required: true, minLength: 1, maxLength: 200 },
  slug: { required: true, minLength: 1, maxLength: 100, pattern: /^[a-z0-9-]+$/ },
  sku: { required: true, minLength: 1, maxLength: 50 },
  description: { required: true, minLength: 1 },
  basePrice: { required: true, min: 0.01 },
  discountedPrice: { min: 0.01 },
  stock: { required: true, min: 0 },
  categoryId: { required: true, custom: (v) => !v ? 'Category is required' : undefined },
  seoTitle: { maxLength: 100 },
  seoDescription: { maxLength: 200 },
}

const FIELD_LABELS: Record<string, string> = {
  name: 'Product Name',
  slug: 'Slug',
  sku: 'SKU',
  description: 'Description',
  basePrice: 'Base Price',
  discountedPrice: 'Discounted Price',
  stock: 'Stock',
  categoryId: 'Category',
  seoTitle: 'SEO Title',
  seoDescription: 'SEO Description',
}

export default function ProductForm({ initial, categories, onSubmit, loading = false }: Props) {
  const [form, setForm] = useState<ProductFormData>(buildInitial(initial))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [autoSlug, setAutoSlug] = useState(!initial)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addToast } = useToast()

  useEffect(() => {
    if (initial) setForm(buildInitial(initial))
  }, [initial])

  const set = <K extends keyof ProductFormData>(key: K, value: ProductFormData[K]) => {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key as string]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[key as string]
        return next
      })
    }
  }

  const validateAll = (data: ProductFormData): Record<string, string> => {
    const errs: Record<string, string> = {}

    for (const [key, rule] of Object.entries(FIELD_RULES)) {
      const val = data[key as keyof ProductFormData] as string | number | undefined
      const error = validateField(val, rule, FIELD_LABELS[key] ?? key)
      if (error) errs[key] = error
    }

    if (data.discountedPrice !== undefined && data.discountedPrice !== null && data.discountedPrice >= data.basePrice) {
      errs.discountedPrice = 'Discounted price must be less than base price'
    }

    if (data.imageUrls.filter(Boolean).length === 0) {
      errs.images = 'At least one image is required'
    }

    const config = data.customizationConfig
    if (config.numberOfImages.enabled && (config.numberOfImages.count < 1 || config.numberOfImages.count > 20)) {
      errs.customizationImages = 'Number of images must be between 1 and 20'
    }
    if (config.numberOfNames.enabled && (config.numberOfNames.count < 1 || config.numberOfNames.count > 20)) {
      errs.customizationNames = 'Number of names must be between 1 and 20'
    }
    if (config.qrCodeImages.enabled && (config.qrCodeImages.count < 1 || config.qrCodeImages.count > 20)) {
      errs.customizationQrCodes = 'Number of QR code images must be between 1 and 20'
    }
    if (config.contactShop.enabled && !config.contactShop.value.trim()) {
      errs.customizationContact = 'Contact details are required'
    }
    if (config.startingFrom.enabled && (!config.startingFrom.amount || config.startingFrom.amount < 0)) {
      errs.customizationStartingFrom = 'Starting From amount is required'
    }

    if (data.variants.length > 0) {
      data.variants.forEach((v, i) => {
        if (!v.name?.trim()) errs[`variant_${i}_name`] = `Variant ${i + 1} name is required`
        if (!v.sku?.trim()) errs[`variant_${i}_sku`] = `Variant ${i + 1} SKU is required`
      })
    }

    if (data.seoTitle && !data.seoDescription) {
      errs.seoDescription = 'SEO Description is required when SEO Title is provided'
    }
    if (data.seoDescription && !data.seoTitle) {
      errs.seoTitle = 'SEO Title is required when SEO Description is provided'
    }

    return errs
  }

  const handleNameChange = (v: string) => {
    set('name', v)
    if (autoSlug) set('slug', slugify(v))
  }

  const handleBlur = (key: keyof ProductFormData) => {
    setTouched((prev) => ({ ...prev, [key]: true }))
    const val = form[key] as string | number | undefined
    const rule = FIELD_RULES[key as string]
    if (rule) {
      const error = validateField(val, rule, FIELD_LABELS[key as string] ?? key)
      if (error) {
        setErrors((prev) => ({ ...prev, [key]: error }))
      } else {
        setErrors((prev) => {
          const next = { ...prev }
          delete next[key as string]
          return next
        })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const allErrors = validateAll(form)
    setErrors(allErrors)
    setTouched(Object.fromEntries(Object.keys(FIELD_RULES).map((k) => [k, true])))
    setTouched((prev) => ({ ...prev, images: true }))

    if (Object.keys(allErrors).length > 0) {
      const firstErrorKey = Object.keys(allErrors)[0]
      addToast(allErrors[firstErrorKey] ?? 'Please fix the validation errors before submitting.', 'error')
      return
    }

    const payload: ProductFormData = {
      ...form,
      imageUrls: form.imageUrls.filter(Boolean),
      images: form.imageUrls.filter(Boolean).map((url, i) => ({
        url,
        sortOrder: i,
        isPrimary: i === 0,
      })),
      discountedPrice: form.discountedPrice || undefined,
      seoTitle: form.seoTitle || undefined,
      seoDescription: form.seoDescription || undefined,
      specifications: Object.fromEntries(
        Object.entries(form.specifications)
          .map(([key, value]) => [key.trim(), String(value).trim()])
          .filter(([key, value]) => key && value),
      ),
      careInstructions: form.careInstructions.trim(),
      variants: form.variants,
    }

    try {
      await onSubmit(payload)
      addToast(initial ? 'Product updated successfully!' : 'Product created successfully!', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Save failed'
      addToast(message, 'error')
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const { url } = await api.admin.uploadImage(file)
      set('imageUrls', [...form.imageUrls, url])
      if (errors.images) {
        setErrors((prev) => { const n = { ...prev }; delete n.images; return n })
      }
      addToast('Image uploaded successfully!', 'success')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Image upload failed'
      addToast(message, 'error')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const inputCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary'
  const inputErrorCls = 'border-red-300 focus:border-red-400 focus:ring-red-100'
  const checkboxCls = 'w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary'

  const updateCustomization = <K extends keyof ProductCustomizationConfig>(
    key: K,
    value: ProductCustomizationConfig[K],
  ) => {
    set('customizationConfig', { ...form.customizationConfig, [key]: value })
  }

  const flatCats = flattenCategories(categories)

  const showError = (key: keyof ProductFormData | 'images') =>
    touched[key as string] ? errors[key as string] : undefined

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Basic info */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">Basic Information</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Product Name" required error={showError('name')}>
            <input
              value={form.name}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={() => handleBlur('name')}
              className={`${inputCls} ${showError('name') ? inputErrorCls : ''}`}
              placeholder="e.g. MDF Oval Cutout"
            />
          </Field>
          <Field label="Slug" required error={showError('slug')}>
            <div className="relative">
              <input
                value={form.slug}
                onChange={(e) => { setAutoSlug(false); set('slug', e.target.value) }}
                onBlur={() => handleBlur('slug')}
                className={`${inputCls} ${showError('slug') ? inputErrorCls : ''}`}
                placeholder="mdf-oval-cutout"
              />
            </div>
          </Field>
          <Field label="SKU" required error={showError('sku')}>
            <input
              value={form.sku}
              onChange={(e) => set('sku', e.target.value)}
              onBlur={() => handleBlur('sku')}
              className={`${inputCls} ${showError('sku') ? inputErrorCls : ''}`}
              placeholder="SKU-001"
            />
          </Field>
          <Field label="Category" required error={showError('categoryId')}>
            <select
              value={form.categoryId}
              onChange={(e) => set('categoryId', e.target.value)}
              onBlur={() => handleBlur('categoryId')}
              className={`${inputCls} ${showError('categoryId') ? inputErrorCls : ''}`}
            >
              <option value="">Select a category</option>
              {flatCats.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Description" required error={showError('description')}>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            onBlur={() => handleBlur('description')}
            rows={4}
            className={`${inputCls} resize-none ${showError('description') ? inputErrorCls : ''}`}
            placeholder="Product description…"
          />
        </Field>
      </div>

      {/* Specifications & care */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
        <div className="border-b border-gray-100 pb-3">
          <h3 className="text-sm font-semibold text-gray-700">Specifications &amp; Care</h3>
          <p className="text-xs text-gray-400 mt-1">Shown on the product detail page.</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-700">Specifications</span>
            <button
              type="button"
              onClick={() => set('specifications', { ...form.specifications, '': '' })}
              className="text-xs font-medium text-primary hover:underline"
            >
              + Add specification
            </button>
          </div>
          {Object.entries(form.specifications).map(([key, value], index) => (
            <div key={`${key}-${index}`} className="grid grid-cols-[1fr_1fr_auto] gap-2">
              <input
                value={key}
                onChange={(e) => {
                  const entries = Object.entries(form.specifications)
                  entries[index] = [e.target.value, value]
                  set('specifications', Object.fromEntries(entries))
                }}
                className={inputCls}
                placeholder="e.g. Material"
                aria-label={`Specification ${index + 1} name`}
              />
              <input
                value={value}
                onChange={(e) => {
                  const entries = Object.entries(form.specifications)
                  entries[index] = [key, e.target.value]
                  set('specifications', Object.fromEntries(entries))
                }}
                className={inputCls}
                placeholder="e.g. Premium MDF"
                aria-label={`Specification ${index + 1} value`}
              />
              <button
                type="button"
                onClick={() => set('specifications', Object.fromEntries(
                  Object.entries(form.specifications).filter((_, i) => i !== index),
                ))}
                className="px-2 text-gray-400 hover:text-red-500"
                aria-label={`Remove specification ${index + 1}`}
              >
                ×
              </button>
            </div>
          ))}
          {Object.keys(form.specifications).length === 0 && (
            <p className="text-xs text-gray-400 italic">No specifications added.</p>
          )}
        </div>
        <Field label="Care instructions">
          <textarea
            value={form.careInstructions}
            onChange={(e) => set('careInstructions', e.target.value)}
            rows={4}
            className={`${inputCls} resize-none`}
            placeholder="Explain how to clean, store, and protect this product..."
          />
        </Field>
      </div>

      {/* Pricing & Stock */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">Pricing & Stock</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <Field label="Base Price (₹)" required error={showError('basePrice')}>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.basePrice}
              onChange={(e) => set('basePrice', Number(e.target.value))}
              onBlur={() => handleBlur('basePrice')}
              className={`${inputCls} ${showError('basePrice') ? inputErrorCls : ''}`}
            />
          </Field>
          <Field label="Discounted Price (₹)" error={showError('discountedPrice')}>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.discountedPrice ?? ''}
              onChange={(e) => set('discountedPrice', e.target.value ? Number(e.target.value) : undefined)}
              onBlur={() => handleBlur('discountedPrice')}
              className={`${inputCls} ${showError('discountedPrice') ? inputErrorCls : ''}`}
              placeholder="Optional"
            />
          </Field>
          <Field label="Stock" required error={showError('stock')}>
            <input
              type="number"
              min={0}
              value={form.stock}
              onChange={(e) => set('stock', Number(e.target.value))}
              onBlur={() => handleBlur('stock')}
              className={`${inputCls} ${showError('stock') ? inputErrorCls : ''}`}
            />
          </Field>
        </div>
        <PriceTiersEditor tiers={form.priceTiers} onChange={(t) => set('priceTiers', t)} />
      </div>

      {/* Images */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="text-sm font-semibold text-gray-700">
            Images <span className="text-red-500">*</span>
          </h3>
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="text-xs font-medium text-primary hover:underline disabled:opacity-60"
            >
              {uploading ? 'Uploading…' : '+ Upload Image'}
            </button>
          </div>
        </div>
        {showError('images') && (
          <p className="text-xs text-red-500">{showError('images')}</p>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {form.imageUrls.map((url, i) => (
            <div key={i} className="relative group aspect-square bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
              <img
                src={url}
                alt={`Product image ${i + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50" y="50" font-size="12" fill="%239ca3af" text-anchor="middle" dominant-baseline="middle"%3EInvalid image%3C/text%3E%3C/svg%3E' }}
              />
              <button
                type="button"
                onClick={() => set('imageUrls', form.imageUrls.filter((_, idx) => idx !== i))}
                className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center bg-white/90 hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full shadow-sm transition-colors opacity-0 group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
          {form.imageUrls.length === 0 && (
            <div className="col-span-full text-sm text-gray-400 italic py-4 text-center border border-dashed border-gray-200 rounded-xl">
              No images uploaded yet. Click "+ Upload Image" to add.
            </div>
          )}
        </div>
      </div>

      {/* Variants */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <VariantsEditor variants={form.variants} onChange={(v) => set('variants', v)} />
        {form.variants.length > 0 && (
          <div className="mt-2 space-y-1">
            {form.variants.map((_v, i) => (
              <div key={i}>
                {touched[`variant_${i}_name` as string] && errors[`variant_${i}_name`] && (
                  <p className="text-xs text-red-500">{errors[`variant_${i}_name`]}</p>
                )}
                {touched[`variant_${i}_sku` as string] && errors[`variant_${i}_sku`] && (
                  <p className="text-xs text-red-500">{errors[`variant_${i}_sku`]}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Customer input requirements */}
      <div className="space-y-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="border-b border-gray-100 pb-3">
          <h3 className="text-sm font-semibold text-gray-700">Customer Input Requirements</h3>
          <p className="mt-1 text-xs text-gray-500">Only checked fields will appear on the product page.</p>
        </div>

        {([
          ['numberOfImages', 'No. of Images'],
          ['numberOfNames', 'No. of Names'],
          ['qrCodeImages', 'QR Code Images'],
        ] as const).map(([key, label]) => {
          const option = form.customizationConfig[key]
          const errorKey = key === 'numberOfImages'
            ? 'customizationImages'
            : key === 'numberOfNames'
              ? 'customizationNames'
              : 'customizationQrCodes'
          return (
            <div key={key} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px] sm:items-center">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={option.enabled}
                  onChange={(e) => updateCustomization(key, { ...option, enabled: e.target.checked })}
                  className={checkboxCls}
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
              {option.enabled && (
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={option.count}
                  aria-label={`${label} required`}
                  onChange={(e) => updateCustomization(key, { ...option, count: Number(e.target.value) })}
                  className={`${inputCls} ${errors[errorKey] ? inputErrorCls : ''}`}
                />
              )}
              {option.enabled && errors[errorKey] && (
                <p className="text-xs text-red-500 sm:col-start-2">{errors[errorKey]}</p>
              )}
            </div>
          )
        })}

        {([
          ['date', 'Date'],
          ['songName', 'Name of the Song'],
        ] as const).map(([key, label]) => {
          const option = form.customizationConfig[key]
          return (
            <label key={key} className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={option.enabled}
                onChange={(e) => updateCustomization(key, { enabled: e.target.checked })}
                className={checkboxCls}
              />
              <span className="text-sm text-gray-700">{label}</span>
            </label>
          )
        })}

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(240px,1fr)] sm:items-center">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.customizationConfig.contactShop.enabled}
              onChange={(e) => updateCustomization('contactShop', {
                ...form.customizationConfig.contactShop,
                enabled: e.target.checked,
              })}
              className={checkboxCls}
            />
            <span className="text-sm text-gray-700">Contact Shop</span>
          </label>
          {form.customizationConfig.contactShop.enabled && (
            <input
              value={form.customizationConfig.contactShop.value}
              onChange={(e) => updateCustomization('contactShop', {
                ...form.customizationConfig.contactShop,
                value: e.target.value,
              })}
              placeholder="Phone, WhatsApp link, or instructions"
              className={`${inputCls} ${errors.customizationContact ? inputErrorCls : ''}`}
            />
          )}
          {errors.customizationContact && <p className="text-xs text-red-500 sm:col-start-2">{errors.customizationContact}</p>}
        </div>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_160px] sm:items-center">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.customizationConfig.startingFrom.enabled}
              onChange={(e) => updateCustomization('startingFrom', {
                ...form.customizationConfig.startingFrom,
                enabled: e.target.checked,
              })}
              className={checkboxCls}
            />
            <span className="text-sm text-gray-700">Starting From</span>
          </label>
          {form.customizationConfig.startingFrom.enabled && (
            <input
              type="number"
              min={0}
              step="0.01"
              value={form.customizationConfig.startingFrom.amount ?? ''}
              onChange={(e) => updateCustomization('startingFrom', {
                ...form.customizationConfig.startingFrom,
                amount: e.target.value === '' ? undefined : Number(e.target.value),
              })}
              placeholder="Amount"
              className={`${inputCls} ${errors.customizationStartingFrom ? inputErrorCls : ''}`}
            />
          )}
          {errors.customizationStartingFrom && <p className="text-xs text-red-500 sm:col-start-2">{errors.customizationStartingFrom}</p>}
        </div>
      </div>

      {/* Flags */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">Flags & Visibility</h3>
        {([
          ['isActive', 'Active (visible on store)'],
          ['isBestSeller', 'Best Seller'],
          ['isFeatured', 'Featured'],
        ] as [keyof ProductFormData, string][]).map(([key, label]) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form[key] as boolean}
              onChange={(e) => set(key, e.target.checked)}
              className={checkboxCls}
            />
            <span className="text-sm text-gray-700">{label}</span>
          </label>
        ))}
      </div>

      {/* SEO */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h3 className="text-sm font-semibold text-gray-700 border-b border-gray-100 pb-3">SEO</h3>
        <Field label="SEO Title" error={showError('seoTitle')}>
          <input
            value={form.seoTitle ?? ''}
            onChange={(e) => set('seoTitle', e.target.value)}
            onBlur={() => handleBlur('seoTitle')}
            className={`${inputCls} ${showError('seoTitle') ? inputErrorCls : ''}`}
          />
        </Field>
        <Field label="SEO Description" error={showError('seoDescription')}>
          <textarea
            value={form.seoDescription ?? ''}
            onChange={(e) => set('seoDescription', e.target.value)}
            onBlur={() => handleBlur('seoDescription')}
            rows={3}
            className={`${inputCls} resize-none ${showError('seoDescription') ? inputErrorCls : ''}`}
          />
        </Field>
      </div>

      <div className="flex gap-3 justify-end pb-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-primary hover:bg-primary-hover rounded-xl transition-colors disabled:opacity-60"
        >
          {loading ? 'Saving…' : initial ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </form>
  )
}
