import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { CategoryCard } from "@/components/CategoryCard";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { 
  AirVent, 
  Refrigerator, 
  WashingMachine, 
  Shirt, 
  CircuitBoard,
  Trash2,
  FileText,
  BookOpen,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const categories = [
  { icon: AirVent, name: "Old AC", rate: "₹800-1500/unit" },
  { icon: Refrigerator, name: "Refrigerator", rate: "₹1200-2000/unit" },
  { icon: WashingMachine, name: "Washing Machine", rate: "₹600-1200/unit" },
  { icon: CircuitBoard, name: "Iron", rate: "₹100-300/unit" },
  { icon: CircuitBoard, name: "Copper", rate: "₹400-500/kg" },
  { icon: Trash2, name: "Plastic", rate: "₹10-20/kg" },
  { icon: FileText, name: "Paper", rate: "₹8-15/kg" },
  { icon: BookOpen, name: "Books", rate: "₹12-18/kg" },
  { icon: Shirt, name: "Clothes", rate: "₹5-10/kg" },
];

export default function Landing() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (name: string) => {
    setSelectedCategories(prev => 
      prev.includes(name) 
        ? prev.filter(c => c !== name)
        : [...prev, name]
    );
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-lg z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="small" />
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" data-testid="button-nav-login">Login</Button>
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <HeroSection />
      
      {/* How It Works */}
      <HowItWorks />

      {/* What We Collect */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold font-[Poppins] mb-4 bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent" data-testid="text-categories-title">
              What We Collect
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select from our wide range of recyclable items with transparent pricing
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.name}
                icon={cat.icon}
                name={cat.name}
                baseRate={cat.rate}
                selected={selectedCategories.includes(cat.name)}
                onClick={() => toggleCategory(cat.name)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section with Gradient */}
      <section className="relative py-24 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1600&h=400&fit=crop')] opacity-10 bg-cover bg-center" />
        
        {/* Content */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/30 mb-6">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">Join 10,000+ Happy Users</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-bold font-[Poppins] mb-6 text-white" data-testid="text-cta-title">
            Get Started Today
          </h2>
          <p className="text-xl text-white/95 mb-10 leading-relaxed max-w-2xl mx-auto">
            Join thousands of users who are turning waste into worth while protecting our planet. Book your first pickup now!
          </p>
          
          <Link href="/login">
            <Button 
              size="lg" 
              className="bg-white text-green-700 hover:bg-white/95 shadow-2xl hover:shadow-white/50 transition-all duration-300 text-lg font-semibold px-10 py-7 h-auto group"
              data-testid="button-get-started"
            >
              Book Your First Pickup
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6">
            {/* Logo & Tagline */}
            <div className="flex flex-col items-center gap-2">
              <Logo size="default" />
              <p className="text-sm text-muted-foreground">Making recycling simple</p>
            </div>

            {/* Legal Links */}
            <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
              <Link href="/legal/terms" data-testid="link-footer-terms">
                <span className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer">
                  Terms
                </span>
              </Link>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <Link href="/legal/privacy" data-testid="link-footer-privacy">
                <span className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer">
                  Privacy
                </span>
              </Link>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <Link href="/legal/disclaimer" data-testid="link-footer-disclaimer">
                <span className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer">
                  Disclaimer
                </span>
              </Link>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <Link href="/legal/vendor-policy" data-testid="link-footer-vendor-policy">
                <span className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer">
                  Vendor Policy
                </span>
              </Link>
              <span className="text-gray-300 dark:text-gray-700">|</span>
              <Link href="/legal/contact" data-testid="link-footer-contact">
                <span className="text-muted-foreground hover:text-green-600 dark:hover:text-green-400 transition-colors cursor-pointer">
                  Contact
                </span>
              </Link>
            </nav>

            {/* Copyright */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">© 2024 eBhangar. All rights reserved.</p>
              <p className="text-xs text-muted-foreground mt-1">Turning waste into worth, one pickup at a time</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
