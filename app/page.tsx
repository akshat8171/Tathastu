import { BannerSection } from '@/components/homepage/banner-section'
import { CategoryIcons } from '@/components/homepage/category-icons'
import { WatchShopSection } from '@/components/homepage/watch-shop-section'
import { BestSellers } from '@/components/homepage/best-sellers'
import { BrandStory } from '@/components/about/brand-story'
import { MeetFounder } from '@/components/about/meet-founder'
import { ReviewsSection } from '@/components/homepage/reviews-section'
import { BulkOrdersSection } from '@/components/homepage/bulk-orders-section'
import { ScrollAnimate } from '@/components/layout/scroll-animate'

export default function HomePage() {
  return (
    <>
      <BannerSection />
      <ScrollAnimate direction="up" delay={0}>
        <CategoryIcons />
      </ScrollAnimate>
      <ScrollAnimate direction="up" delay={100}>
        <WatchShopSection />
      </ScrollAnimate>
      <ScrollAnimate direction="up" delay={200}>
        <BestSellers />
      </ScrollAnimate>
      <ScrollAnimate direction="up" delay={0}>
        <BrandStory />
      </ScrollAnimate>
      <ScrollAnimate direction="up" delay={100}>
        <MeetFounder />
      </ScrollAnimate>
      <ScrollAnimate direction="up" delay={200}>
        <ReviewsSection />
      </ScrollAnimate>
      <ScrollAnimate direction="up" delay={0}>
        <BulkOrdersSection />
      </ScrollAnimate>
    </>
  )
}
