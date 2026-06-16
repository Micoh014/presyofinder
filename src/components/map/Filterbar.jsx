import { STORE_TYPE_FILTERS } from "../../lib/mapUtils";

export default function FilterBar({ activeFilter, onFilterChange }) {
  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-full overflow-x-auto px-4 z-1000">
      <div className="flex gap-2 w-max mx-auto">
        {STORE_TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={(e) => {
              e.stopPropagation();
              onFilterChange(f.value);
            }}
            aria-label={`Filter by ${f.label}`}
            aria-pressed={activeFilter === f.value}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap shadow-md transition-colors ${
              activeFilter === f.value
                ? "bg-green-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            }`}
          >
            {f.icon} {f.label}
          </button>
        ))}
      </div>
    </div>
  );
}
