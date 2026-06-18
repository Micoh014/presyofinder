import { useCallback } from "react";
import { useItems } from "../../hooks/useItems";
import { useFrequentItems } from "../../hooks/useFrequentItems";
import ItemForm from "../storeDetail/ItemForm";
import ItemList from "../storeDetail/ItemList";
import Spinner from "../ui/Spinner";
import EmptyState from "../ui/EmptyState";

const STORE_ICONS = {
  "sari-sari": "🏪",
  karinderia: "🍚",
  palengke: "🥬",
  mall: "🏬",
  supermarket: "🛒",
  "street-vendor": "🛵",
  online: "📦",
};

export default function StorePanelDesktop({
  store,
  userId,
  onClose,
  onDelete,
}) {
  const { items, itemsLoading, itemsError, addItem, updateItem, deleteItem } =
    useItems(store.id, userId);
  const { frequentItems } = useFrequentItems(userId);

  const handleDelete = useCallback(() => {
    onDelete(store.id);
  }, [onDelete, store.id]);

  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: 340,
        zIndex: 700,
      }}
      className="bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 flex flex-col shadow-xl"
    >
      <div className="px-4 py-4 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-2xl shrink-0">
            {STORE_ICONS[store.type] || "📍"}
          </span>
          <div className="min-w-0">
            <p className="font-bold text-gray-800 dark:text-white text-base truncate">
              {store.name}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
              {store.type}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          aria-label="Close store panel"
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none shrink-0 ml-2"
        >
          ×
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <ItemForm
          onAdd={addItem}
          onScanReceipt={() => {}}
          frequentItems={frequentItems}
        />

        {itemsLoading && (
          <p className="text-center py-4">
            <Spinner />
          </p>
        )}

        {itemsError && !itemsLoading && (
          <div className="bg-red-50 dark:bg-red-900/30 rounded-xl px-4 py-3 text-sm text-red-500 dark:text-red-400">
            {itemsError}
          </div>
        )}

        {!itemsLoading && !itemsError && items.length === 0 && (
          <EmptyState description="No items yet — add one above." />
        )}

        <ItemList items={items} onUpdate={updateItem} onDelete={deleteItem} />
      </div>

      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 shrink-0">
        <button
          onClick={handleDelete}
          className="w-full text-xs text-red-400 hover:text-red-500 font-medium py-1.5"
        >
          Delete store
        </button>
      </div>
    </div>
  );
}
