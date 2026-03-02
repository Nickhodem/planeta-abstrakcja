import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCountryPins, type CountryPin, type Video } from "@/data/videos";
import { MapPin, Clock, Eye, ExternalLink, X } from "lucide-react";

const createPinIcon = (count: number) => {
  const size = Math.min(18 + count * 2, 36);
  return L.divIcon({
    className: "custom-pin",
    html: `
      <div style="position:relative;display:flex;align-items:center;justify-content:center;">
        <div class="pin-pulse" style="position:absolute;width:${size}px;height:${size}px;border-radius:50%;background:hsl(32 95% 55% / 0.3);"></div>
        <div style="width:${size}px;height:${size}px;border-radius:50%;background:hsl(32 95% 55%);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:hsl(220 20% 7%);border:2px solid hsl(32 80% 70%);box-shadow:0 0 20px hsl(32 95% 55% / 0.4);">
          ${count}
        </div>
      </div>
    `,
    iconSize: [size + 10, size + 10],
    iconAnchor: [(size + 10) / 2, (size + 10) / 2],
  });
};

const VideoMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const [selectedPin, setSelectedPin] = useState<CountryPin | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center: [30, 20],
      zoom: 3,
      minZoom: 2,
      maxZoom: 8,
      zoomControl: false,
      attributionControl: true,
    });

    L.control.zoom({ position: "bottomleft" }).addTo(map);

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd",
        maxZoom: 19,
      },
    ).addTo(map);

    const pins = getCountryPins();

    pins.forEach((pin) => {
      const marker = L.marker([pin.lat, pin.lng], {
        icon: createPinIcon(pin.videos.length),
      }).addTo(map);

      marker.on("click", () => {
        setSelectedPin(pin);
      });
    });

    mapInstance.current = map;

    // Force Leaflet to recalculate container size
    setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] pointer-events-none">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="pointer-events-auto">
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Planeta Abstrakcja
            </h1>
            <p className="text-xs text-muted-foreground">
              Mapa podróży ·{" "}
              {getCountryPins().reduce((acc, p) => acc + p.videos.length, 0)}{" "}
              filmów · {getCountryPins().length} krajów
            </p>
          </div>
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} className="h-full w-full" />

      {/* Side Panel */}
      {selectedPin && (
        <div className="absolute top-0 right-0 h-full w-full sm:w-96 z-[1000] bg-card/95 backdrop-blur-xl border-l border-border overflow-hidden flex flex-col animate-in slide-in-from-right duration-300">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                <h2 className="font-bold text-foreground text-lg">
                  {selectedPin.country}
                </h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {selectedPin.videos.length}{" "}
                {selectedPin.videos.length === 1
                  ? "film"
                  : selectedPin.videos.length < 5
                    ? "filmy"
                    : "filmów"}
              </p>
            </div>
            <button
              onClick={() => setSelectedPin(null)}
              className="p-1.5 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
            {selectedPin.videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const VideoCard = ({ video }: { video: Video }) => (
  <a
    href={video.youtubeUrl}
    target="_blank"
    rel="noopener noreferrer"
    className="group block rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 hover:border-primary/30 transition-all duration-200 p-4"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors leading-snug line-clamp-2">
          {video.title}
        </h3>
        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {video.duration}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {video.views}
          </span>
          <span>{video.date}</span>
        </div>
      </div>
      <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-0.5" />
    </div>
  </a>
);

export default VideoMap;
