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

// Singleton to ensure setOptions is only called once
let isGoogleMapsInitialized = false;
let googleMapsInitPromise: Promise<void> | null = null;

async function initializeGoogleMaps() {
  if (googleMapsInitPromise) {
    return googleMapsInitPromise;
  }

  googleMapsInitPromise = (async () => {
    if (isGoogleMapsInitialized) return;

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error("Google Maps API key not configured");
    }

    setOptions({ 
      apiKey,
      version: "weekly",
    } as any);

    await importLibrary("maps");
    isGoogleMapsInitialized = true;
  })();

  return googleMapsInitPromise;
}

export function LiveTrackingMap({ 
  vendorLatitude, 
  vendorLongitude, 
  customerAddress,
  bookingId 
}: LiveTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const vendorMarkerRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        await initializeGoogleMaps();
        
        if (!mounted || !mapRef.current) return;

        const defaultCenter = { lat: 19.0760, lng: 72.8777 };
        const mapInstance = new (window as any).google.maps.Map(mapRef.current, {
          center: defaultCenter,
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: true,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }]
            }
          ]
        });

        mapInstanceRef.current = mapInstance;
        
        if (mounted) {
          setIsLoading(false);
          setMapReady(true);
        }
      } catch (err) {
        console.error("Error loading Google Maps:", err);
        if (mounted) {
          setError("Failed to load map");
          setIsLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || vendorLatitude === null || vendorLongitude === null) return;

    const vendorPosition = {
      lat: Number(vendorLatitude),
      lng: Number(vendorLongitude),
    };

    const google = (window as any).google;

    if (vendorMarkerRef.current) {
      vendorMarkerRef.current.setPosition(vendorPosition);
      mapInstanceRef.current.panTo(vendorPosition);
    } else {
      const marker = new google.maps.Marker({
        position: vendorPosition,
        map: mapInstanceRef.current,
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

      vendorMarkerRef.current = marker;
      mapInstanceRef.current.setCenter(vendorPosition);
    }
  }, [mapReady, vendorLatitude, vendorLongitude]);

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-3 border-green-600 border-t-transparent"></div>
          <div className="text-center">
            <p className="font-medium text-foreground">Loading map...</p>
            <p className="text-sm text-muted-foreground mt-1">This may take a few seconds</p>
          </div>
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
