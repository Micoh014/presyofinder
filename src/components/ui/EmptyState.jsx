import { PackageOpen } from "lucide-react";
<EmptyState icon={PackageOpen} description="No items yet - add one above." />;

export default function EmptyState({
  icon: Icon,
  emoji = "📍",
  title,
  description,
}) {
  return (
    <div className="text-center py-4">
      {Icon ? (
        <Icon
          className="mx-auto mb-2 text-gray-300 dark:text-gray-600"
          size={28}
          strokeWidth={1.5}
        />
      ) : (
        <p className="text-2xl mb-2">{emoji}</p>
      )}
      {title && (
        <p className="font-semibold text-gray-800 dark:text-white text-sm">
          {title}
        </p>
      )}
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {description}
        </p>
      )}
    </div>
  );
}
