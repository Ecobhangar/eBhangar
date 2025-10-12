import { Button } from "@/components/ui/button";
import { Leaf } from "lucide-react";

export function HeroSection() {
  return (
    <div className="relative h-[500px] overflow-hidden">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1600&h=500&fit=crop')"
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary/90 to-primary/70" />
      </div>
      
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-2xl text-white">
          <div className="flex items-center gap-2 mb-4">
            <Leaf className="w-10 h-10" />
            <h1 className="text-5xl font-bold font-[Poppins]" data-testid="text-hero-title">eBhangar</h1>
          </div>
          <p className="text-xl mb-2 text-white/95">Smart Scrap Collection</p>
          <p className="text-lg mb-8 text-white/90">
            Turn your waste into worth. Book instant pickups for electronics, metal, plastic, paper, and more. 
            Get fair prices while contributing to a sustainable future.
          </p>
          <div className="flex gap-4">
            <Button 
              size="lg" 
              variant="outline" 
              className="backdrop-blur-md bg-white/10 border-white/30 text-white hover:bg-white/20"
              data-testid="button-book-pickup"
            >
              Book a Pickup
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="backdrop-blur-md bg-white/10 border-white/30 text-white hover:bg-white/20"
              data-testid="button-learn-more"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
