export type ReviewStatus = 'approved' | 'pending'
export type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

export interface ReviewItem {
  readonly id: string
  readonly productName: string
  readonly productImage: string
  readonly productImageAlt: string
  readonly rating: number
  readonly reviewText: string
  readonly displayDate: string
  readonly isoDate?: string
  readonly status: ReviewStatus
}

export interface ReviewFormProduct {
  readonly id: string
  readonly name: string
}

export interface ReviewFormData {
  readonly productId: string
  readonly rating: number
  readonly reviewText: string
}

export interface ReviewFormErrors {
  productId?: string
  rating?: string
  reviewText?: string
}
