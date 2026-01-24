import { BannerSection } from '@/components/homepage/banner-section'
import { CategoryIcons } from '@/components/homepage/category-icons'
import { WatchShopSection } from '@/components/homepage/watch-shop-section'
import { BestSellers } from '@/components/homepage/best-sellers'
import { BrandStory } from '@/components/about/brand-story'
import { MeetFounder } from '@/components/about/meet-founder'
import { ReviewsSection } from '@/components/homepage/reviews-section'
import { BulkOrdersSection } from '@/components/homepage/bulk-orders-section'

export default function HomePage() {
  return (
    <>
      <BannerSection />
      <CategoryIcons />
      <BestSellers />
      <WatchShopSection />
      <BrandStory />
      <MeetFounder />
      <ReviewsSection />
      <BulkOrdersSection />
    </>
  )
}
