import { MapPin } from "lucide-react";

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center z-9999">
      <div className="mb-4 animate-bounce">
        <MapPin size={56} className="text-green-500" strokeWidth={1.75} />
      </div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        PresyoFinder
      </h1>
      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
        Your personal price map
      </p>
      <div className="mt-6 w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full animate-spin"></div>
    </div>
  );
}
