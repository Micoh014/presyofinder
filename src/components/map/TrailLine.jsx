import { Polyline } from "react-leaflet";

export default function TrailLine({ trailTarget, userPosition, trailRoute }) {
  if (!trailTarget || !userPosition) return null;

  return (
    <Polyline
      positions={
        trailRoute || [
          [userPosition.lat, userPosition.lng],
          [trailTarget.latitude, trailTarget.longitude],
        ]
      }
      pathOptions={{ color: "#3b82f6", weight: 3, dashArray: "8, 8" }}
    />
  );
}
