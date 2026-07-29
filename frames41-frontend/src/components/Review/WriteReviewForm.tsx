import { useState, useCallback, useId, useEffect } from 'react'
import type {
  ReviewFormProduct,
  ReviewFormData,
  ReviewFormErrors,
  FormStatus,
} from '../../types/review'
import { MAX_REVIEW_LENGTH, MIN_REVIEW_LENGTH } from '../../constants/review'
import Icon from '../ui/Icon'
import StarRatingInput from './StarRatingInput'

interface WriteReviewFormProps {
  readonly products: ReadonlyArray<ReviewFormProduct>
  readonly onSubmit: (data: ReviewFormData) => Promise<void>
  readonly initialProductId?: string
}

const INITIAL_FORM: ReviewFormData = { productId: '', rating: 0, reviewText: '' }

function validate(form: ReviewFormData): ReviewFormErrors {
  const errors: ReviewFormErrors = {}
  if (!form.productId) {
    errors.productId = 'Please select a product.'
  }
  if (form.rating < 1) {
    errors.rating = 'Please select a star rating.'
  }
  const trimmed = form.reviewText.trim()
  if (trimmed.length < MIN_REVIEW_LENGTH) {
    errors.reviewText = `Review must be at least ${MIN_REVIEW_LENGTH} characters.`
  } else if (trimmed.length > MAX_REVIEW_LENGTH) {
    errors.reviewText = `Review cannot exceed ${MAX_REVIEW_LENGTH} characters.`
  }
  return errors
}

export default function WriteReviewForm({ products, onSubmit, initialProductId }: WriteReviewFormProps) {
  const isProductLocked = !!initialProductId
  const selectedProduct = isProductLocked
    ? products.find((p) => p.id === initialProductId)
    : undefined

  const [form, setForm] = useState<ReviewFormData>({
    ...INITIAL_FORM,
    productId: initialProductId ?? '',
  })
  const [errors, setErrors] = useState<ReviewFormErrors>({})
  const [status, setStatus] = useState<FormStatus>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Sync productId when initialProductId changes (e.g. after mount or navigation)
  useEffect(() => {
    if (initialProductId) {
      setForm((prev) => ({ ...prev, productId: initialProductId }))
    }
  }, [initialProductId])

  const formId = useId()
  const statusRegionId = useId()
  const productSelectId = `${formId}-product`
  const textareaId = `${formId}-text`
  const charCountId = `${formId}-char-count`

  const isSubmitting = status === 'submitting'

  const handleProductChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const productId = e.target.value
    setForm((prev) => ({ ...prev, productId }))
    setErrors((prev) => ({ ...prev, productId: undefined }))
  }, [])

  const handleRatingChange = useCallback((rating: number) => {
    setForm((prev) => ({ ...prev, rating }))
    setErrors((prev) => ({ ...prev, rating: undefined }))
  }, [])

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const reviewText = e.target.value.slice(0, MAX_REVIEW_LENGTH)
    setForm((prev) => ({ ...prev, reviewText }))
    setErrors((prev) => ({ ...prev, reviewText: undefined }))
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const nextErrors = validate(form)
      if (Object.keys(nextErrors).length > 0) {
        setErrors(nextErrors)
        return
      }
      setStatus('submitting')
      setSubmitError(null)
      try {
        await onSubmit({ ...form, reviewText: form.reviewText.trim() })
        setStatus('success')
        setForm({
          ...INITIAL_FORM,
          productId: initialProductId ?? '',
        })
        setErrors({})
      } catch (err) {
        setStatus('error')
        setSubmitError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      }
    },
    [form, onSubmit, initialProductId],
  )

  const charCount = form.reviewText.length
  const charCountNearLimit = charCount > MAX_REVIEW_LENGTH * 0.9

  return (
    <aside className="lg:col-span-5">
      <div className="sticky top-28 bg-surface border border-outline-variant p-md">
        <h2 className="font-headline-md text-headline-md mb-sm" id={`${formId}-title`}>
          Write a Review
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant mb-md">
          Share your thoughts on your recent purchase from the collection.
        </p>

        {(status === 'success' || status === 'error') && (
          <div
            id={statusRegionId}
            role={status === 'error' ? 'alert' : 'status'}
            aria-live={status === 'error' ? 'assertive' : 'polite'}
            className={`mb-md p-sm border font-label-bold text-label-bold ${
              status === 'success'
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-error bg-error/5 text-error'
            }`}
          >
            {status === 'success'
              ? 'Your review has been submitted for approval.'
              : (submitError ?? 'Something went wrong. Please try again.')}
          </div>
        )}

        <form
          id={formId}
          aria-labelledby={`${formId}-title`}
          onSubmit={handleSubmit}
          noValidate
          className="space-y-md"
        >
          {/* Product selector */}
          <div>
            <label
              htmlFor={productSelectId}
              className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-xs"
            >
              {isProductLocked ? 'Product' : 'Select Product'}
            </label>
            {isProductLocked && selectedProduct ? (
              <div
                id={productSelectId}
                className="w-full h-14 bg-surface border border-outline-variant px-sm flex items-center font-body-md text-on-surface"
              >
                {selectedProduct.name}
              </div>
            ) : (
              <select
                id={productSelectId}
                value={form.productId}
                onChange={handleProductChange}
                disabled={isSubmitting}
                aria-required="true"
                aria-invalid={!!errors.productId}
                aria-describedby={errors.productId ? `${productSelectId}-error` : undefined}
                className={`w-full h-14 bg-surface border px-sm focus:border-on-surface outline-none font-body-md transition-colors appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.productId ? 'border-error' : 'border-outline-variant'
                }`}
              >
                <option value="">Choose a product…</option>
                {products.map(({ id, name }) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            )}
            {errors.productId && (
              <p
                id={`${productSelectId}-error`}
                role="alert"
                className="mt-xs font-label-sm text-label-sm text-error"
              >
                {errors.productId}
              </p>
            )}
          </div>

          {/* Star rating */}
          <div>
            <span className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-xs">
              Overall Rating
            </span>
            <StarRatingInput
              value={form.rating}
              onChange={handleRatingChange}
              disabled={isSubmitting}
            />
            {errors.rating && (
              <p role="alert" className="mt-xs font-label-sm text-label-sm text-error">
                {errors.rating}
              </p>
            )}
          </div>

          {/* Review textarea */}
          <div>
            <label
              htmlFor={textareaId}
              className="block font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest mb-xs"
            >
              Your Experience
            </label>
            <textarea
              id={textareaId}
              value={form.reviewText}
              onChange={handleTextChange}
              disabled={isSubmitting}
              rows={5}
              placeholder="What did you love about this piece?"
              aria-required="true"
              aria-invalid={!!errors.reviewText}
              aria-describedby={`${charCountId}${errors.reviewText ? ` ${textareaId}-error` : ''}`}
              className={`w-full bg-surface border p-sm focus:border-on-surface outline-none font-body-md transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed ${
                errors.reviewText ? 'border-error' : 'border-outline-variant'
              }`}
            />
            <div className="flex justify-between items-start mt-xs">
              {errors.reviewText ? (
                <p
                  id={`${textareaId}-error`}
                  role="alert"
                  className="font-label-sm text-label-sm text-error"
                >
                  {errors.reviewText}
                </p>
              ) : (
                <span />
              )}
              <span
                id={charCountId}
                aria-live="polite"
                aria-atomic="true"
                className={`font-label-sm text-label-sm ml-auto ${
                  charCountNearLimit ? 'text-error' : 'text-on-surface-variant'
                }`}
              >
                {charCount}/{MAX_REVIEW_LENGTH}
              </span>
            </div>
          </div>

          <div className="pt-xs">
            <button
              type="submit"
              disabled={isSubmitting}
              aria-describedby={
                status === 'success' || status === 'error' ? statusRegionId : undefined
              }
              className="w-full bg-primary text-on-primary font-label-bold text-label-bold uppercase tracking-widest py-5 px-md hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              {isSubmitting ? 'Submitting…' : 'Submit Feedback'}
            </button>
          </div>
        </form>

        {/* Verified badge */}
        <div className="mt-md pt-md border-t border-outline-variant">
          <div className="flex items-center gap-sm">
            <Icon name="verified" className="text-primary" aria-hidden="true" />
            <p className="font-label-sm text-label-sm text-on-surface-variant">
              Your feedback is verified by Frames 41's authentic purchase system.
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
