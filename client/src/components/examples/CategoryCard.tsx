import { CategoryCard } from '../CategoryCard';
import { AirVent } from 'lucide-react';
import { useState } from 'react';

export default function CategoryCardExample() {
  const [selected, setSelected] = useState(false);
  
  return (
    <div className="p-4 max-w-xs">
      <CategoryCard 
        icon={AirVent}
        name="Old AC"
        baseRate="₹800-1500/unit"
        selected={selected}
        onClick={() => setSelected(!selected)}
      />
    </div>
  );
}
