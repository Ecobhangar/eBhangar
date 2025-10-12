import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface CategoryCardProps {
  icon: LucideIcon;
  name: string;
  baseRate: string;
  selected?: boolean;
  onClick?: () => void;
}

export function CategoryCard({ icon: Icon, name, baseRate, selected, onClick }: CategoryCardProps) {
  return (
    <Card 
      className={`p-6 hover-elevate active-elevate-2 cursor-pointer transition-all ${
        selected ? "border-2 border-primary" : ""
      }`}
      onClick={onClick}
      data-testid={`card-category-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="flex flex-col items-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
          <Icon className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-lg">{name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{baseRate}</p>
        </div>
        <Button 
          variant={selected ? "default" : "outline"} 
          className="w-full"
          data-testid={`button-select-${name.toLowerCase().replace(/\s+/g, '-')}`}
        >
          {selected ? "Selected" : "Select"}
        </Button>
      </div>
    </Card>
  );
}
