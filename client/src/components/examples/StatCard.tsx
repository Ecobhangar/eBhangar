import { StatCard } from '../StatCard';
import { Package } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="p-4 max-w-xs">
      <StatCard 
        title="Total Bookings"
        value={248}
        icon={Package}
        trend={{ value: "12% from last month", positive: true }}
      />
    </div>
  );
}
