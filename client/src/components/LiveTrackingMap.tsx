import { useEffect, useRef, useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import { Card } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";

interface LiveTrackingMapProps {
  vendorLatitude: number | null;
  vendorLongitude: number | null;
  customerAddress: string;
  bookingId: string;
}

export function LiveTrackingMap({ 
  vendorLatitude, 
  vendorLongitude, 
  customerAddress,
  bookingId 
}: LiveTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [vendorMarker, setVendorMarker] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      setError("Google Maps API key not configured");
      setIsLoading(false);
      return;
    }

    (async () => {
      try {
        setOptions({ 
          apiKey,
          version: "weekly",
        } as any);

        await importLibrary("maps");
        await importLibrary("marker");
        
        if (!mapRef.current) return;

        const defaultCenter = { lat: 19.0760, lng: 72.8777 };
        const mapInstance = new (window as any).google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        setMap(mapInstance);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading Google Maps:", err);
        setError("Failed to load map");
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!map || vendorLatitude === null || vendorLongitude === null) return;

    const vendorPosition = {
      lat: Number(vendorLatitude),
      lng: Number(vendorLongitude),
    };

    const google = (window as any).google;

    if (vendorMarker) {
      vendorMarker.setPosition(vendorPosition);
      map.panTo(vendorPosition);
    } else {
      const marker = new google.maps.Marker({
        position: vendorPosition,
        map: map,
        title: "Vendor Location",
        animation: google.maps.Animation.BOUNCE,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: "#10b981",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        },
      });

      setVendorMarker(marker);
      map.setCenter(vendorPosition);
    }
  }, [map, vendorLatitude, vendorLongitude, vendorMarker]);

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-600 border-t-transparent"></div>
          <span>Loading map...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="text-center text-muted-foreground">
          <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div 
          ref={mapRef} 
          className="w-full h-[400px]" 
          data-testid={`map-tracking-${bookingId}`}
        />
      </Card>

      {vendorLatitude && vendorLongitude ? (
        <Card className="p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <Navigation className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                Vendor is on the way!
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Track live location on the map above. The vendor will arrive at: {customerAddress}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-amber-600 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                Waiting for vendor location
              </h3>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                The vendor's location will appear here once they start the pickup journey.
              </p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
