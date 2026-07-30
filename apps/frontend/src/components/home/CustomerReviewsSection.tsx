import Icon from '../ui/Icon'

interface ReviewItem {
  id: string
  name: string
  location: string
  avatarUrl: string
  purchasedProduct: string
  reviewText: string
  rating: number
  isTamil?: boolean
}

const REVIEWS: ReadonlyArray<ReviewItem> = [
  {
    id: 'rev-1',
    name: 'Mohammed Zafar',
    location: 'Ooty',
    avatarUrl: '/avatars/mohammed_zafar.png',
    purchasedProduct: '03 Nikkah Booklets',
    reviewText:
      'Mashallah! The Nikkah booklet print quality and gold engraving exceeded our expectations. Truly premium work for our special day!',
    rating: 5,
  },
  {
    id: 'rev-2',
    name: 'Dinesh Kannan',
    location: 'Villupuram',
    avatarUrl: '/avatars/dinesh_kannan.png',
    purchasedProduct: '03 Wooden Keychain',
    reviewText:
      'Outstanding craftsmanship! The custom wooden keychain was carved so sharply and delivered within 3 days.',
    rating: 5,
  },
  {
    id: 'rev-3',
    name: 'Shanmugavel',
    location: 'Coimbatore',
    avatarUrl: '/avatars/shanmugavel.png',
    purchasedProduct: '03 QR Code Standy',
    reviewText:
      'கடைக்காக வாங்கிய QR கோடு ஸ்டேண்ட் ரொம்ப தரமாவும் அழகாவும் இருக்கு! வாடிக்கையாளர்கள் எல்லோரும் பாராட்டுறாங்க.',
    rating: 5,
    isTamil: true,
  },
  {
    id: 'rev-4',
    name: 'Kavin Velusamy',
    location: 'Pollachi',
    avatarUrl: '/avatars/kavin_velusamy.png',
    purchasedProduct: '02 Acrylic Thumb Boards',
    reviewText:
      'Top notch quality! The acrylic thumb board finish looks super classy in person. Very happy with the purchase!',
    rating: 5,
  },
]

export default function CustomerReviewsSection() {
  return (
    <section
      id="customer-reviews"
      aria-labelledby="reviews-heading"
      className="pt-6 pb-12 sm:pt-8 sm:pb-16 max-w-container mx-auto px-4 sm:px-6"
    >
      {/* Header */}
      <div className="text-center mb-12 sm:mb-16">
        <span className="mb-2 block text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-[#800020]">
          Verified Customer Feedback
        </span>
        <h2
          id="reviews-heading"
          className="font-headline text-2xl sm:text-headline-lg italic font-extrabold text-[#2b0b14]"
        >
          Loved by Customers Across India
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-[#58111a]/70 max-w-md mx-auto">
          Read genuine reviews from customers who purchased customized photo frames and gifts.
        </p>
      </div>

      {/* 4 Review Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {REVIEWS.map((rev) => (
          <article
            key={rev.id}
            className="flex flex-col justify-between rounded-2xl bg-[#faf8f0] p-6 border border-[#800020]/20 shadow-md hover:border-[#800020] hover:shadow-[0_12px_32px_rgba(128,0,32,0.15)] transition-all duration-500 overflow-hidden"
          >
            <div>
              {/* Customer Header Info */}
              <div className="flex items-center gap-3.5 mb-4">
                <div className="relative shrink-0 w-12 h-12">
                  <img
                    src={rev.avatarUrl}
                    alt={rev.name}
                    style={{ width: '48px', height: '48px', maxWidth: '48px', maxHeight: '48px' }}
                    className="w-12 h-12 rounded-full object-cover shrink-0 border-2 border-[#800020]/40 shadow-sm"
                  />
                  <span
                    className="absolute -bottom-1 -right-1 bg-[#800020] text-amber-300 rounded-full p-0.5 border border-amber-300 flex items-center justify-center"
                    title="Verified Buyer"
                  >
                    <Icon name="check_circle" className="text-[10px]" />
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-extrabold text-sm text-[#2b0b14] truncate">
                    {rev.name}
                  </h3>
                  <p className="text-xs text-[#800020] font-semibold flex items-center gap-1">
                    <Icon name="location_on" className="text-xs text-[#800020]" />
                    {rev.location}
                  </p>
                </div>
              </div>

              {/* Star Rating */}
              <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Icon
                    key={i}
                    name="star"
                    filled
                    className="text-sm fill-current text-amber-500"
                  />
                ))}
                <span className="text-[11px] font-bold text-[#800020] ml-1.5 bg-[#efe7d3] px-2 py-0.5 rounded border border-[#800020]/20">
                  Verified Buyer ✓
                </span>
              </div>

              {/* Review Text */}
              <p
                className={`text-xs sm:text-sm text-[#2b0b14] leading-relaxed mb-6 font-medium ${
                  rev.isTamil ? 'font-sans text-[13px] leading-snug' : ''
                }`}
              >
                "{rev.reviewText}"
              </p>
            </div>

            {/* Purchased Product Tag */}
            <div className="border-t border-[#800020]/15 pt-3.5 mt-auto flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#58111a]/60">
                Purchased:
              </span>
              <span className="text-[11px] font-extrabold text-[#800020] bg-[#efe7d3] px-3 py-1 rounded-full border border-[#800020]/20 truncate max-w-[160px]">
                {rev.purchasedProduct}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
