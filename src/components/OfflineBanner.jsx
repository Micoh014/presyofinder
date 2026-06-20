import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="... flex items-center justify-center gap-2"
    >
      <WifiOff size={14} />
      You're offline — changes won't be saved until you reconnect.
    </div>
  );
}
