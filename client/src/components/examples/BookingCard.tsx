import { BookingCard } from '../BookingCard';

export default function BookingCardExample() {
  return (
    <div className="p-4 max-w-2xl">
      <BookingCard 
        id="1"
        customerName="Rahul Sharma"
        phone="+91 98765 43210"
        address="123, MG Road, Bangalore"
        items={[
          { category: "Old AC", quantity: 2 },
          { category: "Refrigerator", quantity: 1 }
        ]}
        totalValue={3500}
        status="pending"
        date={new Date()}
      />
    </div>
  );
}
