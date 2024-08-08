import Navbar from "../components/Navbar"
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import UrbanCultureSection from "../components/UrbanCultureSection";

function Home() {
  return (
    <div>
      <Navbar/>
      <div>
      <section className="relative bg-gray-200 h-screen flex items-center justify-center overflow-hidden">
      {/* Main content */}
      <div className="text-center z-10">
        <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-2">RETRO LOW</h2>
        <h3 className="text-2xl md:text-4xl lg:text-5xl font-semibold mb-4">'UNIVERSITY ORANGE'</h3>
        <p className="text-sm md:text-base lg:text-lg mb-6">Where iconic design meets sky-high style!</p>
        <Button variant="outline" className="border-black text-black hover:bg-black hover:text-white transition-colors">
          SHOP NOW
        </Button>
      </div>

      {/* Image placeholder */}
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-gray-300 flex items-center justify-center">
          <span className="text-gray-500 text-lg">Product Image</span>
        </div>
      </div>

      {/* Navigation arrows */}
      <button className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20">
        <ChevronLeft className="w-8 h-8 text-black" />
      </button>
      <button className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20">
        <ChevronRight className="w-8 h-8 text-black" />
      </button>

      {/* Slide indicators */}
      <div className="absolute bottom-4 left-4 z-20">
        <span className="text-black text-lg font-semibold">01</span>
      </div>
      <div className="absolute bottom-4 right-4 z-20">
        <span className="text-black text-lg font-semibold">02</span>
      </div>
    </section>
    <UrbanCultureSection/>
      </div>
    </div>
  )
}

export default Home
