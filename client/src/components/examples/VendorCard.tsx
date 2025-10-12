import { VendorCard } from '../VendorCard';

export default function VendorCardExample() {
  return (
    <div className="p-4 max-w-md">
      <VendorCard 
        id="1"
        name="Vikram Kabadiwala"
        phone="+91 99999 11111"
        location="Indiranagar, Bangalore"
        onAssign={() => console.log('Vendor assigned')}
      />
    </div>
  );
}
