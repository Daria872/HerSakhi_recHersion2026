import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";

export interface MapMarkerItem {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  badge?: string;
  iconType?: "USER" | "CLINIC" | "CAPTAIN" | "POLICE";
  onClick?: () => void;
}

interface LeafletLiveMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: MapMarkerItem[];
  showUserLiveLocation?: boolean;
  onUserLocationFound?: (lat: number, lng: number) => void;
  routePolyline?: Array<[number, number]>;
  className?: string;
  height?: string;
}

export const LeafletLiveMap: React.FC<LeafletLiveMapProps> = ({
  center = [28.6083, 77.2954], // Default Delhi Mayur Vihar area
  zoom = 14,
  markers = [],
  showUserLiveLocation = true,
  onUserLocationFound,
  routePolyline,
  className = "",
  height = "320px",
}) => {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const markerGroupRef = useRef<L.LayerGroup | null>(null);
  const polylineRef = useRef<L.Polyline | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<"SEARCHING" | "LOCKED" | "DENIED">("SEARCHING");

  // Create custom marker icons
  const createCustomIcon = (type: "USER" | "CLINIC" | "CAPTAIN" | "POLICE") => {
    let bg = "#6b3749";
    let iconChar = "location_on";

    if (type === "USER") {
      bg = "#0284c7"; // Blue pulsing for user
      iconChar = "my_location";
      return L.divIcon({
        className: "leaflet-custom-marker",
        html: `
          <div style="position:relative; width:34px; height:34px; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; width:34px; height:34px; border-radius:50%; background:rgba(2,132,199,0.3); animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
            <div style="width:24px; height:24px; border-radius:50%; background:#0284c7; color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.3); border:2px solid #ffffff;">
              <span class="material-symbols-outlined" style="font-size:14px;">person</span>
            </div>
          </div>
        `,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
      });
    } else if (type === "CAPTAIN") {
      bg = "#fe959d";
      return L.divIcon({
        className: "leaflet-custom-marker",
        html: `
          <div style="width:30px; height:30px; border-radius:50%; background:#e11d48; color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.3); border:2px solid #ffffff;">
            <span class="material-symbols-outlined" style="font-size:16px;">electric_rickshaw</span>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
    } else if (type === "POLICE") {
      return L.divIcon({
        className: "leaflet-custom-marker",
        html: `
          <div style="width:30px; height:30px; border-radius:50%; background:#dc2626; color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.3); border:2px solid #ffffff;">
            <span class="material-symbols-outlined" style="font-size:16px;">local_police</span>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
    } else {
      // CLINIC
      return L.divIcon({
        className: "leaflet-custom-marker",
        html: `
          <div style="width:30px; height:30px; border-radius:50%; background:#0d9488; color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(0,0,0,0.3); border:2px solid #ffffff;">
            <span class="material-symbols-outlined" style="font-size:16px;">local_hospital</span>
          </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
      });
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center,
      zoom,
      zoomControl: true,
      attributionControl: true,
    });

    // Add OpenStreetMap Tile Layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors • HerSakhi Live GPS',
    }).addTo(map);

    const markerGroup = L.layerGroup().addTo(map);
    markerGroupRef.current = markerGroup;
    mapInstanceRef.current = map;

    // Capture Real-Time Live User Location via HTML5 Geolocation
    if (showUserLiveLocation && navigator.geolocation) {
      setGpsStatus("SEARCHING");

      const updatePos = (pos: GeolocationPosition) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLiveCoords({ lat, lng });
        setGpsStatus("LOCKED");

        if (onUserLocationFound) {
          onUserLocationFound(lat, lng);
        }

        // Add or update live user marker
        if (mapInstanceRef.current) {
          if (!userMarkerRef.current) {
            const userIcon = createCustomIcon("USER");
            const marker = L.marker([lat, lng], { icon: userIcon, zIndexOffset: 1000 })
              .addTo(mapInstanceRef.current)
              .bindPopup(`
                <div style="padding:4px; font-family:sans-serif; text-align:center;">
                  <strong style="color:#0284c7; display:block;">📍 Your Live Location</strong>
                  <span style="font-size:11px; color:#555;">GPS Accuracy: ±${Math.round(pos.coords.accuracy)}m</span>
                </div>
              `);
            userMarkerRef.current = marker;
          } else {
            userMarkerRef.current.setLatLng([lat, lng]);
          }
        }
      };

      const handleErr = (err: GeolocationPositionError) => {
        console.warn("Live Geolocation error/fallback:", err.message);
        setGpsStatus("DENIED");
      };

      navigator.geolocation.getCurrentPosition(updatePos, handleErr, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      });

      const watchId = navigator.geolocation.watchPosition(updatePos, handleErr, {
        enableHighAccuracy: true,
        maximumAge: 10000,
      });
      watchIdRef.current = watchId;
    }

    return () => {
      if (watchIdRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers when markers prop changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markerGroupRef.current) return;

    markerGroupRef.current.clearLayers();

    markers.forEach((m) => {
      const icon = createCustomIcon(m.iconType || "CLINIC");
      const marker = L.marker([m.lat, m.lng], { icon })
        .addTo(markerGroupRef.current!)
        .bindPopup(`
          <div style="padding:4px 6px; font-family:sans-serif; max-width:200px;">
            <strong style="font-size:12px; color:#23191f; display:block;">${m.title}</strong>
            ${m.subtitle ? `<span style="font-size:11px; color:#555; display:block; margin-top:2px;">${m.subtitle}</span>` : ""}
            ${m.badge ? `<span style="display:inline-block; font-size:10px; font-weight:bold; background:#e0f2fe; color:#0369a1; padding:2px 6px; border-radius:10px; margin-top:4px;">${m.badge}</span>` : ""}
          </div>
        `);

      if (m.onClick) {
        marker.on("click", m.onClick);
      }
    });
  }, [markers]);

  // Update Route Polyline if provided
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    if (polylineRef.current) {
      polylineRef.current.remove();
      polylineRef.current = null;
    }

    if (routePolyline && routePolyline.length > 1) {
      const poly = L.polyline(routePolyline, {
        color: "#e11d48",
        weight: 4,
        opacity: 0.8,
        dashArray: "6, 8",
      }).addTo(mapInstanceRef.current);
      polylineRef.current = poly;

      // Fit bounds to show entire route
      mapInstanceRef.current.fitBounds(poly.getBounds(), { padding: [30, 30] });
    }
  }, [routePolyline]);

  const handleRecenterLive = () => {
    if (!mapInstanceRef.current) return;
    if (liveCoords) {
      mapInstanceRef.current.flyTo([liveCoords.lat, liveCoords.lng], 15, { animate: true });
      if (userMarkerRef.current) userMarkerRef.current.openPopup();
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setLiveCoords({ lat, lng });
        setGpsStatus("LOCKED");
        mapInstanceRef.current?.flyTo([lat, lng], 15, { animate: true });
      });
    }
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-outline-variant/30 shadow-md ${className}`}>
      {/* Real-time Map Container */}
      <div ref={mapContainerRef} style={{ height, width: "100%", zIndex: 1 }} />

      {/* GPS Status Badge */}
      <div className="absolute top-3 left-3 z-[10] px-3 py-1 rounded-full bg-surface-container-lowest/90 backdrop-blur-md border border-outline-variant/30 text-xs flex items-center gap-2 shadow-sm">
        <span
          className={`w-2 h-2 rounded-full ${
            gpsStatus === "LOCKED"
              ? "bg-emerald-500 animate-pulse"
              : gpsStatus === "SEARCHING"
              ? "bg-amber-500 animate-ping"
              : "bg-stone-400"
          }`}
        ></span>
        <span className="font-semibold text-primary text-[11px]">
          {gpsStatus === "LOCKED"
            ? `Live GPS Active (${liveCoords ? `${liveCoords.lat.toFixed(3)}, ${liveCoords.lng.toFixed(3)}` : "Locked"})`
            : gpsStatus === "SEARCHING"
            ? "Acquiring Real-time GPS..."
            : "Default Region (Mayur Vihar, Delhi)"}
        </span>
      </div>

      {/* Recenter Button */}
      <button
        type="button"
        onClick={handleRecenterLive}
        className="absolute bottom-3 right-3 z-[10] px-3 py-1.5 rounded-full bg-surface-container-lowest/95 backdrop-blur-md hover:bg-surface-container text-primary font-bold text-xs flex items-center gap-1.5 shadow-md border border-outline-variant/30 transition-all active:scale-95"
        title="Center map on your real live location"
      >
        <span className="material-symbols-outlined text-[16px] text-secondary">my_location</span>
        <span>My Live Location</span>
      </button>
    </div>
  );
};
