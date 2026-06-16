import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export default function LocationMarker({ onLocationFound, onLocationError }) {
  const map = useMap();

  useEffect(() => {
    let marker = null;
    map.locate({ setView: true, maxZoom: 16 });

    map.on("locationfound", (e) => {
      onLocationFound(e.latlng);
      if (marker) map.removeLayer(marker);
      marker = L.circleMarker(e.latlng, {
        radius: 8,
        fillColor: "#3b82f6",
        color: "#ffffff",
        weight: 2,
        fillOpacity: 1,
      }).addTo(map);
    });

    map.on("locationerror", () => {
      alert("Could not get your location. Please allow location access.");
    });

    return () => {
      if (marker) map.removeLayer(marker);
    };
  }, [map]);

  return null;
}
