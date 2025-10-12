import { HeroSection } from "@/components/HeroSection";
import { HowItWorks } from "@/components/HowItWorks";
import { CategoryCard } from "@/components/CategoryCard";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { 
  AirVent, 
  Refrigerator, 
  WashingMachine, 
  Shirt, 
  CircuitBoard,
  Trash2,
  FileText,
  BookOpen,
  Leaf
} from "lucide-react";
import { useState } from "react";

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
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-7 h-7 text-primary" />
            <span className="text-xl font-bold font-[Poppins]" data-testid="text-logo">eBhangar</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" data-testid="button-nav-login">Login</Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <HeroSection />
      <HowItWorks />

      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold font-[Poppins] mb-3" data-testid="text-categories-title">
              What We Collect
            </h2>
            <p className="text-muted-foreground">Select from our wide range of recyclable items</p>
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

      <section className="py-16 bg-primary/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold font-[Poppins] mb-4" data-testid="text-cta-title">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of users who are turning waste into worth while protecting our planet
          </p>
          <Button size="lg" data-testid="button-get-started">
            Get Started Today
          </Button>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 eBhangar. All rights reserved.</p>
            <p className="mt-2">Making recycling simple, one pickup at a time.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
