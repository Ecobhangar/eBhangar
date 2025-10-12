import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantitySelector({ value, onChange, min = 0, max = 100 }: QuantitySelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        size="icon"
        variant="outline"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        data-testid="button-decrease-quantity"
      >
        <Minus className="w-4 h-4" />
      </Button>
      <span className="text-lg font-semibold min-w-[2rem] text-center" data-testid="text-quantity-value">
        {value}
      </span>
      <Button
        size="icon"
        variant="outline"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        data-testid="button-increase-quantity"
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  );
}
