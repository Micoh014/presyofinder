import { useState, useEffect, useRef } from "react";

export function useReverseGeocode(userPosition) {
  const [locationLabel, setLocationLabel] = useState(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!userPosition || fetchedRef.current) return;
    fetchedRef.current = true;

    async function fetchLocation() {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userPosition.lat}&lon=${userPosition.lng}&zoom=10&addressdetails=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        const addr = data.address || {};
        const city = addr.city || addr.town || addr.municipality || addr.county || "Unknown area";
        const region = addr.state || addr.region || "";
        const country = addr.country || "";
        setLocationLabel({ city, subtitle: [region, country].filter(Boolean).join(", ") });
      } catch (err) {
        console.error("Reverse geocode failed:", err);
        setLocationLabel({ city: "Your location", subtitle: "" });
      }
    }

    fetchLocation();
  }, [userPosition]);

  return locationLabel;
}