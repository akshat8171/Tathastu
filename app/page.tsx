import { BannerSection } from '@/components/homepage/banner-section'
import { CategoryIcons } from '@/components/homepage/category-icons'
import { BestSellers } from '@/components/homepage/best-sellers'
import { ReviewsSection } from '@/components/homepage/reviews-section'

export default function HomePage() {
  return (
    <>
      <BannerSection />
      <CategoryIcons />
      <BestSellers />
      <ReviewsSection />
    </>
  )
}
