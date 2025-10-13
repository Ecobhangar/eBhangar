import { Card } from "@/components/ui/card";
import { LucideIcon, Check } from "lucide-react";

interface CategoryCardProps {
  icon: LucideIcon;
  name: string;
  baseRate: string;
  selected?: boolean;
  onClick?: () => void;
}

export function CategoryCard({ icon: Icon, name, baseRate, selected, onClick }: CategoryCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && onClick) {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card 
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      className={`group relative p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 overflow-hidden focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 ${
        selected 
          ? "border-2 border-green-500 bg-green-50/50 dark:bg-green-950/30" 
          : "border border-border hover:border-green-200 dark:hover:border-green-800"
      }`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      data-testid={`card-category-${name.toLowerCase().replace(/\s+/g, '-')}`}
    >
      {/* Gradient Background on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-500/0 group-hover:from-green-500/5 group-hover:to-emerald-500/5 transition-all duration-300" />
      
      {/* Content */}
      <div className="relative flex flex-col items-center text-center gap-4">
        {/* Icon with Gradient Background */}
        <div className={`relative w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-300 ${
          selected 
            ? "bg-gradient-to-br from-green-500 to-emerald-600 scale-110" 
            : "bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 group-hover:scale-110 group-hover:rotate-3"
        }`}>
          <Icon className={`w-10 h-10 transition-colors ${
            selected ? "text-white" : "text-green-600 dark:text-green-400"
          }`} />
          
          {/* Selected Checkmark */}
          {selected && (
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white dark:bg-green-900 flex items-center justify-center shadow-lg">
              <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
          )}
        </div>

        {/* Text */}
        <div>
          <h3 className="font-semibold text-lg font-[Poppins] mb-1">{name}</h3>
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/40">
            <span className="text-sm font-medium text-green-700 dark:text-green-300">{baseRate}</span>
          </div>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-400/0 to-emerald-400/0 group-hover:from-green-400/10 group-hover:to-emerald-400/10 transition-all duration-500 pointer-events-none" />
      </div>
    </Card>
  );
}
