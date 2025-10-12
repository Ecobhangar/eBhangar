import { QuantitySelector } from '../QuantitySelector';
import { useState } from 'react';

export default function QuantitySelectorExample() {
  const [quantity, setQuantity] = useState(1);
  
  return (
    <div className="p-4">
      <QuantitySelector value={quantity} onChange={setQuantity} />
    </div>
  );
}
