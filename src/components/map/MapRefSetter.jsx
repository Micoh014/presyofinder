import { useEffect } from "react";
import { useMap } from "react-leaflet";

export default function MapRefSetter({ mapRef }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map]);
  return null;
}
