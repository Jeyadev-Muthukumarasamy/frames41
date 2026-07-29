import { useState, useEffect } from 'react'
import { api } from '@/lib/api'
import type { FaqItem, FaqCategory } from '@/types/faq'

export function useFAQ() {
  const [items, setItems] = useState<FaqItem[]>([])
  const [categories, setCategories] = useState<FaqCategory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.faqs.list().then((faqItems: any[]) => {
      setItems(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (faqItems ?? []).map((f: any): FaqItem => ({
          id: f.id,
          question: f.question,
          answer: f.answer,
          categoryId: f.category?.toLowerCase() ?? 'orders',
        })),
      )
      const allCat: FaqCategory = { id: 'all', label: 'All' }
      const cats = [...new Set((faqItems ?? []).map((f: any) => f.category).filter(Boolean))]
      const mapped: FaqCategory[] = cats.map(
        (c: string): FaqCategory => ({ id: c.toLowerCase() as FaqCategory['id'], label: c }),
      )
      setCategories([allCat, ...mapped])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return { items, categories, loading }
}
