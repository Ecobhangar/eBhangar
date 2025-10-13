import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function HeroSection() {
  return (
    <div className="relative h-[600px] md:h-[700px] overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=1600&h=700&fit=crop')"
        }}
      >
        {/* Soft Green Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/60 via-green-700/50 to-emerald-600/40" />
      </div>
      
      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles className="w-4 h-4 text-green-300" />
            <span className="text-sm font-medium text-white">India's #1 Smart Scrap Platform</span>
          </div>

          {/* Hero Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-[Poppins] text-white mb-6 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100" data-testid="text-hero-title">
            Turn Waste Into Worth
          </h1>
          
          <p className="text-xl md:text-2xl text-white/95 mb-8 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            Book instant pickups for electronics, metals, plastics & more. Get fair prices while building a sustainable future.
          </p>

          {/* CTA Buttons with Glow */}
          <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Link href="/login">
              <Button 
                size="lg" 
                className="bg-white text-green-700 hover:bg-white/95 shadow-2xl hover:shadow-green-500/50 transition-all duration-300 text-base font-semibold px-8 py-6 h-auto group"
                data-testid="button-book-pickup"
              >
                Book Pickup Now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline"
              className="backdrop-blur-md bg-white/10 border-2 border-white/40 text-white hover:bg-white/20 hover:border-white/60 shadow-xl transition-all duration-300 text-base font-semibold px-8 py-6 h-auto"
              data-testid="button-learn-more"
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
