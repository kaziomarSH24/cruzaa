import Layout from "@/components/layout/Layout";
import SEO from "@/components/layout/SEO";
import HeroSlider from "@/components/home/HeroSlider";
import InteractiveProductFeature from "@/components/home/InteractiveProductFeature";
import InstagramFeed from "@/components/home/InstagramFeed";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import PromoSection from "@/components/home/PromoSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import FeaturesShowcase from "@/components/home/FeaturesShowcase";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <Layout>
      <SEO />
      <HeroSlider />
      <InteractiveProductFeature />
      <InstagramFeed />
      <FeaturesShowcase />

      <FeaturedProducts />
      <CategoryShowcase />
      <TestimonialsSection />
      {/* <CTASection /> */}
    </Layout>
  );
};

export default Index;
