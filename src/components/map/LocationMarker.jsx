import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

export default function LocationMarker({ onLocationFound, onLocationError }) {
  const map = useMap();
  const markerRef = useRef(null);
  const callbackRef = useRef(onLocationFound);
  const errorRef = useRef(onLocationError);

  callbackRef.current = onLocationFound;
  errorRef.current = onLocationError;

  useEffect(() => {
    function handleFound(e) {
      callbackRef.current(e.latlng);
      if (markerRef.current) map.removeLayer(markerRef.current);
      markerRef.current = L.circleMarker(e.latlng, {
        radius: 8,
        fillColor: "#3b82f6",
        color: "#ffffff",
        weight: 2,
        fillOpacity: 1,
      }).addTo(map);
    }

    function handleError(e) {
      if (errorRef.current) errorRef.current();
    }

    map.on("locationfound", handleFound);
    map.on("locationerror", handleError);
    map.locate({
      setView: false,
      maxZoom: 16,
      enableHighAccuracy: true,
      timeout: 10000,
    });

    return () => {
      map.off("locationfound", handleFound);
      map.off("locationerror", handleError);
      if (markerRef.current) map.removeLayer(markerRef.current);
    };
  }, [map]);

  return null;
}
