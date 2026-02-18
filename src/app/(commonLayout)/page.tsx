// app/page.tsx
import { CategorySection } from "@/components/modules/homepage/CategorySection";
import { FeaturedMedicines } from "@/components/modules/homepage/FeaturedMedicines";
import { HealthTips } from "@/components/modules/homepage/HealthTips";
import { HeroBanner } from "@/components/modules/homepage/HeroBanner";
import { HowItWorks } from "@/components/modules/homepage/HowItWorks";
import { Newsletter } from "@/components/modules/homepage/Newsletter";
import { StatsSection } from "@/components/modules/homepage/StatsSection";
import { TopSellers } from "@/components/modules/homepage/TopSellers";
import { TrustBadges } from "@/components/modules/homepage/TrustBadges";
import { homeService } from "@/services/home.service";

export default async function HomePage() {
  const { data, error } = await homeService.getHomepageData({
    revalidate: 3600,
  });

  if (error || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center p-8 bg-red-50 rounded-lg">
          <h2 className="text-2xl font-bold text-red-600 mb-2">
            Unable to Load Page
          </h2>
          <p className="text-gray-600">Please refresh the page or try again later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/30 to-white">
      {/* Hero Banner */}
      <HeroBanner />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Stats Section */}
        <StatsSection stats={data.stats} />

        {/* Categories Section */}
        <CategorySection categories={data.categories} />

        {/* Featured Medicines */}
        <FeaturedMedicines medicines={data.featuredMedicines} />

        {/* Top Sellers */}
        <TopSellers sellers={data.topSellers} />

        {/* How It Works */}
        <HowItWorks />

        {/* Health Tips */}
        <HealthTips />

        {/* Newsletter */}
        <Newsletter />
      </div>
    </div>
  );
}