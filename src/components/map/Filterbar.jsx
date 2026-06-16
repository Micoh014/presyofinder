import { memo } from "react";
import { STORE_TYPE_FILTERS } from "../../lib/mapUtils";

function FilterBar({ activeFilter, onFilterChange }) {
  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        overflowY: "hidden",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div
        style={{
          display: "inline-flex",
          flexDirection: "row",
          gap: "8px",
          padding: "2px 4px",
        }}
      >
        {STORE_TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={(e) => {
              e.stopPropagation();
              onFilterChange(f.value);
            }}
            aria-label={`Filter by ${f.label}`}
            aria-pressed={activeFilter === f.value}
            style={{ flexShrink: 0 }}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shadow-md transition-all ${
              activeFilter === f.value
                ? "bg-green-500 text-white"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
            }`}
          >
            <span>{f.icon}</span>
            <span>{f.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default memo(FilterBar);
