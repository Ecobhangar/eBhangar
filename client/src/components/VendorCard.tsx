import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, Phone } from "lucide-react";

interface VendorCardProps {
  id: string;
  name: string;
  phone: string;
  location: string;
  avatar?: string;
  onAssign?: () => void;
}

export function VendorCard({ id, name, phone, location, avatar, onAssign }: VendorCardProps) {
  const initials = name.split(" ").map(n => n[0]).join("").toUpperCase();
  
  return (
    <Card className="p-6 hover-elevate" data-testid={`card-vendor-${id}`}>
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={avatar} />
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <h3 className="font-semibold text-lg" data-testid={`text-vendor-name-${id}`}>{name}</h3>
          <div className="space-y-1 mt-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span data-testid={`text-vendor-location-${id}`}>{location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span data-testid={`text-vendor-phone-${id}`}>{phone}</span>
            </div>
          </div>
        </div>
      </div>
      {onAssign && (
        <Button className="w-full mt-4" onClick={onAssign} data-testid={`button-assign-vendor-${id}`}>
          Assign to Pickup
        </Button>
      )}
    </Card>
  );
}
