import { useOnlineStatus } from "../hooks/useOnlineStatus";

export default function OfflineBanner() {
  const isOnline = useOnlineStatus();
  if (isOnline) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed top-0 left-0 right-0 z-9999 bg-yellow-400 text-yellow-900 text-sm font-medium text-center py-2 px-4 safe-top"
    >
      ⚠️ You're offline — changes won't be saved until you reconnect.
    </div>
  );
}
