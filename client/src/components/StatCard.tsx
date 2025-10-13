import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    positive: boolean;
  };
  gradient?: string;
}

export function StatCard({ title, value, icon: Icon, trend, gradient = "from-green-500 to-emerald-600" }: StatCardProps) {
  return (
    <Card className="group relative p-6 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Gradient Background on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/0 to-emerald-500/0 group-hover:from-green-500/5 group-hover:to-emerald-500/5 transition-all duration-300" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground mb-2" data-testid="text-stat-title">{title}</p>
          <p className="text-3xl md:text-4xl font-bold font-[Poppins] bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent" data-testid="text-stat-value">
            {value}
          </p>
          {trend && (
            <p className={`text-sm mt-2 font-medium ${trend.positive ? "text-green-600 dark:text-green-400" : "text-destructive"}`} data-testid="text-stat-trend">
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
        
        {/* Icon with Gradient */}
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
      </div>

      {/* Subtle Bottom Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500/0 via-green-500/50 to-green-500/0 group-hover:via-green-500/100 transition-all duration-300" />
    </Card>
  );
}
