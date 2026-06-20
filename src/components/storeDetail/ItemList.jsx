import { useState } from "react";
import { ShoppingCart } from "lucide-react";

const FRESHNESS_DAYS = 30;

function isStale(dateStr) {
  const recorded = new Date(dateStr);
  const now = new Date();
  const diffDays = (now - recorded) / (1000 * 60 * 60 * 24);
  return diffDays > FRESHNESS_DAYS;
}

export default function ItemList({ items, onUpdate, onDelete }) {
  const [editingItem, setEditingItem] = useState(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemPrice, setEditItemPrice] = useState("");

  async function handleUpdate(itemId) {
    const success = await onUpdate(itemId, editItemName, editItemPrice);
    if (success) setEditingItem(null);
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-700 dark:text-gray-200">
        Items{" "}
        <span className="text-gray-500 dark:text-gray-400 font-normal">
          ({items.length})
        </span>
      </h3>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-400 dark:text-gray-500">
          <ShoppingCart className="mx-auto mb-2" size={28} strokeWidth={1.5} />
          <p className="text-sm">No items yet. Add one above.</p>
        </div>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className="bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3"
        >
          {editingItem === item.id ? (
            <div className="space-y-2">
              <label htmlFor={`edit-name-${item.id}`} className="sr-only">
                Item name
              </label>
              <input
                id={`edit-name-${item.id}`}
                className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                value={editItemName}
                onChange={(e) => setEditItemName(e.target.value)}
                placeholder="Item name"
              />
              <label htmlFor={`edit-price-${item.id}`} className="sr-only">
                Item price
              </label>
              <input
                id={`edit-price-${item.id}`}
                className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                value={editItemPrice}
                onChange={(e) => setEditItemPrice(e.target.value)}
                placeholder="Price"
                type="number"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 Updating will refresh the date to today
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg py-1.5 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdate(item.id)}
                  className="flex-1 bg-green-500 text-white rounded-lg py-1.5 text-xs font-medium"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800 dark:text-gray-100 text-sm">
                  {item.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(item.recorded_at).toLocaleDateString("en-PH")}
                </p>
                {isStale(item.recorded_at) && (
                  <p className="text-xs text-orange-400">⚠️ May be outdated</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <p className="font-bold text-gray-800 dark:text-gray-100">
                  ₱{parseFloat(item.price).toFixed(2)}
                </p>
                <button
                  onClick={() => {
                    setEditingItem(item.id);
                    setEditItemName(item.name);
                    setEditItemPrice(item.price);
                  }}
                  aria-label={`Edit ${item.name}`}
                  className="text-blue-300 dark:text-blue-400 hover:text-blue-500 text-xs font-medium"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  aria-label={`Delete ${item.name}`}
                  className="text-red-300 dark:text-red-400 hover:text-red-500 text-xl leading-none p-2 -m-2"
                >
                  &times;
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
