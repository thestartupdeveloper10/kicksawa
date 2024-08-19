import Navbar from "../components/Navbar"
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UrbanCultureSection from "../components/UrbanCultureSection";
import FeaturedProductsSection from "../components/FeaturedProductsSection";
import PopularSneakersSection from "../components/PopularSneakersSection";
import Footer from "../components/Footer";
import ExclusiveBrandsSection from "../components/ExclusiveBrandsSection";
import HeroSection from "../components/HeroSection";

function Home() {
  return (
    <div>
      <Navbar/>
      <div>
    <HeroSection/>
    <UrbanCultureSection/>
    <FeaturedProductsSection/>
    <PopularSneakersSection/>
    <ExclusiveBrandsSection/>
      </div>
      <Footer/>
    </div>
  )
}

export default Home
