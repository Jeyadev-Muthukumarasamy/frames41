import { useFAQ } from '@/hooks/useFAQ'
import Faq from '@/components/faq/Faq'

export default function FAQPage() {
  const { items, categories, loading } = useFAQ()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#800020] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <Faq
      categories={categories}
      items={items}
    />
  )
}
