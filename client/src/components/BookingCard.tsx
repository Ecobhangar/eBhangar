import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Phone, Trash2, Edit, XCircle } from "lucide-react";
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
  referenceId?: string | null;
  customerName: string;
  phone: string;
  address: string;
  items: Array<{ category: string; quantity: number }>;
  totalValue: number;
  paymentMode?: string | null;
  status: "pending" | "accepted" | "rejected" | "on_the_way" | "completed";
  date: Date;
  completedAt?: Date | null;
  onDelete?: (id: string) => void;
  onEdit?: (id: string) => void;
  onCancel?: (id: string) => void;
  showActions?: boolean;
  vendors?: Array<{ id: string; name: string; phone: string }>;
  onAssignVendor?: (bookingId: string, vendorId: string) => void;
  isAdmin?: boolean;
  vendorInfo?: { name: string; phone: string };
}

const statusConfig = {
  pending: { color: "bg-chart-3 text-white", label: "Pending" },
  accepted: { color: "bg-blue-600 text-white", label: "Accepted" },
  rejected: { color: "bg-red-600 text-white", label: "Rejected" },
  on_the_way: { color: "bg-chart-4 text-white", label: "On the Way" },
  completed: { color: "bg-primary text-primary-foreground", label: "Completed" },
};

export function BookingCard({ id, referenceId, customerName, phone, address, items, totalValue, paymentMode, status, date, completedAt, onDelete, onEdit, onCancel, showActions = false, vendors = [], onAssignVendor, isAdmin = false, vendorInfo }: BookingCardProps) {
  const config = statusConfig[status];
  
  const getBorderColor = () => {
    switch (status) {
      case 'pending': return 'border-l-chart-3';
      case 'accepted': return 'border-l-blue-600';
      case 'rejected': return 'border-l-red-600';
      case 'on_the_way': return 'border-l-chart-4';
      case 'completed': return 'border-l-primary';
      default: return 'border-l-gray-400';
    }
  };

  return (
    <Card className={`p-6 border-l-4 ${getBorderColor()}`} data-testid={`card-booking-${id}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg" data-testid={`text-customer-${id}`}>{customerName}</h3>
            {referenceId && (
              <Badge variant="outline" className="text-xs" data-testid={`text-reference-${id}`}>
                {referenceId}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <Calendar className="w-4 h-4" />
            <span data-testid={`text-date-${id}`}>{format(date, "PPP")}</span>
            {paymentMode && (
              <>
                <span>•</span>
                <span className="capitalize" data-testid={`text-payment-${id}`}>{paymentMode}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={config.color} data-testid={`badge-status-${id}`}>{config.label}</Badge>
          {showActions && (
            <>
              {status === "pending" && (
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
              {(status === "accepted" || status === "on_the_way") && onCancel && (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => onCancel(id)}
                  data-testid={`button-cancel-${id}`}
                >
                  <XCircle className="w-4 h-4 text-destructive" />
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
        {isAdmin && vendorInfo && (status === "assigned" || status === "completed") && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-1">
              {status === "completed" ? "Completed by:" : "Assigned to:"}
            </p>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-primary" />
              <span className="font-medium" data-testid={`text-vendor-name-${id}`}>{vendorInfo.name}</span>
              <span className="text-muted-foreground" data-testid={`text-vendor-phone-${id}`}>• {vendorInfo.phone}</span>
            </div>
          </div>
        )}
        {!isAdmin && status === "completed" && completedAt && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="font-medium text-primary" data-testid={`text-pickup-done-${id}`}>
                Pickup done on {format(new Date(completedAt), "PPP 'at' p")}
              </span>
            </div>
          </div>
        )}
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
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{vendor.name}</span>
                      <span className="text-muted-foreground text-xs">• {vendor.phone}</span>
                    </div>
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
