import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Phone, Trash2, Edit, UserPlus } from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BookingCardProps {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  items: Array<{ category: string; quantity: number }>;
  totalValue: number;
  status: "pending" | "assigned" | "completed";
  date: Date;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  showActions?: boolean;
  vendors?: Array<{ id: string; name: string }>;
  onAssignVendor?: (bookingId: string, vendorId: string) => void;
  isAdmin?: boolean;
}

const statusConfig = {
  pending: { color: "bg-chart-3 text-white", label: "Pending" },
  assigned: { color: "bg-chart-4 text-white", label: "Assigned" },
  completed: { color: "bg-primary text-primary-foreground", label: "Completed" },
};

export function BookingCard({ id, customerName, phone, address, items, totalValue, status, date, onDelete, onEdit, showActions = false, vendors = [], onAssignVendor, isAdmin = false }: BookingCardProps) {
  const config = statusConfig[status];
  
  return (
    <Card className={`p-6 border-l-4 ${status === 'pending' ? 'border-l-chart-3' : status === 'assigned' ? 'border-l-chart-4' : 'border-l-primary'}`} data-testid={`card-booking-${id}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg" data-testid={`text-customer-${id}`}>{customerName}</h3>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Calendar className="w-4 h-4" />
            <span data-testid={`text-date-${id}`}>{format(date, "PPP")}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={config.color} data-testid={`badge-status-${id}`}>{config.label}</Badge>
          {showActions && status === "pending" && (
            <>
              {onEdit && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onEdit(id)}
                  data-testid={`button-edit-${id}`}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onDelete(id)}
                  data-testid={`button-delete-${id}`}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-4 h-4 text-muted-foreground" />
          <span data-testid={`text-phone-${id}`}>{phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-muted-foreground" />
          <span data-testid={`text-address-${id}`}>{address}</span>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <p className="text-sm font-medium mb-2">Items:</p>
        <div className="flex flex-wrap gap-2 mb-3">
          {items.map((item, idx) => (
            <Badge key={idx} variant="secondary" data-testid={`badge-item-${id}-${idx}`}>
              {item.category} x{item.quantity}
            </Badge>
          ))}
        </div>
        <p className="text-xl font-bold text-primary" data-testid={`text-value-${id}`}>₹{totalValue.toLocaleString()}</p>
        
        {isAdmin && status === "pending" && vendors.length > 0 && onAssignVendor && (
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">Assign to Vendor:</p>
            <Select onValueChange={(vendorId) => onAssignVendor(id, vendorId)}>
              <SelectTrigger className="w-full" data-testid={`select-vendor-${id}`}>
                <SelectValue placeholder="Select a vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id} value={vendor.id} data-testid={`vendor-option-${vendor.id}`}>
                    {vendor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </Card>
  );
}
