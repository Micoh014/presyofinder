import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import ReceiptScanner from "./ReceiptScanner";
import { useModalKeyboard } from "../lib/useModalKeyboard";

const STORE_TYPES = [
  { value: "sari-sari", label: "🏪 Sari-sari Store" },
  { value: "karinderia", label: "🍚 Karinderia" },
  { value: "palengke", label: "🥬 Palengke" },
  { value: "mall", label: "🏬 Mall" },
  { value: "supermarket", label: "🛒 Supermarket" },
  { value: "street-vendor", label: "🛵 Street Vendor" },
  { value: "online", label: "📦 Online Seller" },
];
const STORE_ICONS = {
  "sari-sari": "🏪",
  karinderia: "🍚",
  palengke: "🥬",
  mall: "🏬",
  supermarket: "🛒",
  "street-vendor": "🛵",
  online: "📦",
};

const FRESHNESS_DAYS = 30;

function isStale(dateStr) {
  const recorded = new Date(dateStr);
  const now = new Date();
  const diffDays = (now - recorded) / (1000 * 60 * 60 * 24);
  return diffDays > FRESHNESS_DAYS;
}

export default function StoreDetail({ store, onClose, onDelete, userId }) {
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(store.name);
  const [editType, setEditType] = useState(store.type);
  const [editingItem, setEditingItem] = useState(null);
  const [editItemName, setEditItemName] = useState("");
  const [editItemPrice, setEditItemPrice] = useState("");
  const modalRef = useModalKeyboard(onClose);

  useEffect(() => {
    fetchItems();
  }, [store.id]);
  async function handleUpdateStore() {
    if (!editName.trim()) return alert("Store name cannot be empty.");
    const { error } = await supabase
      .from("stores")
      .update({ name: editName, type: editType })
      .eq("id", store.id);
    if (error) return alert("Error updating store: " + error.message);
    store.name = editName;
    store.type = editType;
    setEditing(false);
  }

  async function fetchItems() {
    const { data } = await supabase
      .from("items")
      .select("*")
      .eq("store_id", store.id)
      .order("recorded_at", { ascending: false });
    if (data) setItems(data);
  }

  async function handleUpdateItem(itemId) {
    if (!editItemName.trim()) return alert("Item name cannot be empty.");
    if (!editItemPrice || isNaN(editItemPrice))
      return alert("Please enter a valid price.");

    const { error } = await supabase
      .from("items")
      .update({
        name: editItemName.trim(),
        price: parseFloat(editItemPrice),
        recorded_at: new Date().toISOString(),
      })
      .eq("id", itemId);

    if (error) return alert("Error updating item: " + error.message);
    setEditingItem(null);
    fetchItems();
  }

  async function handleAddItem() {
    if (!itemName.trim()) return alert("Please enter an item name.");
    if (!itemPrice || isNaN(itemPrice))
      return alert("Please enter a valid price.");
    setLoading(true);
    const { error } = await supabase.from("items").insert([
      {
        store_id: store.id,
        name: itemName.trim(),
        price: parseFloat(itemPrice),
        user_id: userId,
      },
    ]);
    setLoading(false);
    if (error) return alert("Error saving item: " + error.message);
    setItemName("");
    setItemPrice("");
    fetchItems();
  }

  async function handleDeleteItem(itemId) {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("items").delete().eq("id", itemId);
    if (error) return alert("Error deleting item: " + error.message);
    fetchItems();
  }

  async function handleReceiptItems(scannedItems) {
    for (const item of scannedItems) {
      await supabase.from("items").insert([
        {
          store_id: store.id,
          name: item.name,
          price: parseFloat(item.price),
          user_id: userId,
        },
      ]);
    }
    setShowScanner(false);
    fetchItems();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-1000">
      <div
        ref={modalRef}
        role="dialog"
        aria-model="true"
        aria-labelledby="store-detail-title"
        className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl max-h-[85vh] overflow-y-auto"
      >
        {/* Store Photo */}
        {store.photo_url && (
          <div className="relative">
            <img
              src={store.photo_url}
              alt={store.name}
              className="w-full h-44 object-cover rounded-t-3xl"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent rounded-t-3xl" />
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div>
                <h2
                  id="store-detail-title"
                  className="text-xl font-bold text-gray-800 dark:text-white"
                >
                  {STORE_ICONS[store.type] || "📍"} {store.name}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 not-[]:capitalize">
                  {store.type}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onDelete(store.id)}
                  aria-label="Delete store"
                  className="bg-red-500/80 text-white text-xs px-3 py-1 rounded-full"
                >
                  Delete
                </button>
                <button
                  onClick={onClose}
                  aria-label="Close"
                  className="bg-white/20 text-white text-xl w-8 h-8 rounded-full flex items-center justify-center"
                >
                  &times;
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header (no photo) */}
        {!store.photo_url && (
          <div className="px-6 pt-6 pb-2">
            {editing ? (
              <div className="space-y-3">
                <input
                  className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                />
                <select
                  className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value)}
                >
                  {STORE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-600 rounded-xl py-2 text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateStore}
                    className="flex-1 bg-green-500 text-white rounded-xl py-2 text-sm font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-start">
                <div>
                  <h2
                    id="store-detail-tile"
                    className="text-xl font-bold text-gray-800"
                  >
                    {STORE_ICONS[store.type] || "📍"} {store.name}
                  </h2>
                  <p className="text-sm text-gray-400 capitalize">
                    {store.type}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditing(true)}
                    aria-label="Edit store"
                    className="text-blue-400 dark:text-blue-300 text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(store.id)}
                    aria-label="Delete store"
                    className="text-red-400 dark:text-red-300 text-sm font-medium"
                  >
                    Delete
                  </button>
                  <button
                    onClick={onClose}
                    aria-label="Close"
                    className="text-gray-400 dark:text-gray-500 text-2xl leading-none"
                  >
                    &times;
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="px-6 pb-6 space-y-4 pt-4">
          {/* Add Item Form */}
          <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 space-y-3">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200">
              Add Item
            </h3>
            <input
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
              placeholder="Item name (e.g. Rice 1kg)"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />

            <input
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
              placeholder="Price (e.g. 52.00)"
              type="number"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
            />

            <button
              onClick={handleAddItem}
              disabled={loading}
              className="w-full bg-green-500 text-white rounded-xl py-2.5 font-semibold text-sm disabled:opacity-50"
            >
              {loading ? "Saving..." : "+ Add Item"}
            </button>
            <button
              onClick={() => setShowScanner(true)}
              className="w-full border border-green-400 dark:border-green-500 text-green-600 dark:text-green-400 rounded-xl py-2.5 font-semibold text-sm"
            >
              🧾 Scan Receipt Instead
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700 dark:text-gray-200">
              Items{" "}
              <span className="text-gray-400 dark:text-gray-500 font-normal">
                ({items.length})
              </span>
            </h3>

            {items.length === 0 && (
              <div className="text-center py-8 text-gray-400 dark:text-gray-500">
                <p className="text-3xl mb-2">🛒</p>
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
                    <input
                      className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                      value={editItemName}
                      onChange={(e) => setEditItemName(e.target.value)}
                      placeholder="Item name"
                    />
                    <input
                      className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                      value={editItemPrice}
                      onChange={(e) => setEditItemPrice(e.target.value)}
                      placeholder="Price"
                      type="number"
                    />
                    <p className="text-xs text-gray-400">
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
                        onClick={() => handleUpdateItem(item.id)}
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
                        <p className="text-xs text-orange-400">
                          ⚠️ May be outdated
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold text-green-600">
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
                        onClick={() => handleDeleteItem(item.id)}
                        aria-label={`Delete ${item.name}`}
                        className="text-red-300 dark:text-red-400 hover:text-red-500 text-lg leading-none p-2 -m-2"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {showScanner && (
        <ReceiptScanner
          onItemsFound={handleReceiptItems}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
