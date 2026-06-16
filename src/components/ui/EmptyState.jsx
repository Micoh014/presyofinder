export default function EmptyState({ icon = "📍", title, description }) {
  return (
    <div className="text-center py-4">
      <p className="text-2xl mb-2">{icon}</p>
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
