import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import ReceiptScanner from "./ReceiptScanner";

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

export default function StoreDetail({ store, onClose, onDelete }) {
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [store.id]);

  async function fetchItems() {
    const { data } = await supabase
      .from("items")
      .select("*")
      .eq("store_id", store.id)
      .order("recorded_at", { ascending: false });
    if (data) setItems(data);
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
        },
      ]);
    }
    setShowScanner(false);
    fetchItems();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-1000">
      <div className="bg-white w-full max-w-md rounded-t-3xl max-h-[85vh] overflow-y-auto">
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
                <h2 className="text-xl font-bold text-white">
                  {STORE_ICONS[store.type] || "📍"} {store.name}
                </h2>
                <p className="text-sm text-white/70 capitalize">{store.type}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onDelete(store.id)}
                  className="bg-red-500/80 text-white text-xs px-3 py-1 rounded-full"
                >
                  Delete
                </button>
                <button
                  onClick={onClose}
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
          <div className="flex justify-between items-start px-6 pt-6 pb-2">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {STORE_ICONS[store.type] || "📍"} {store.name}
              </h2>
              <p className="text-sm text-gray-400 capitalize">{store.type}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onDelete(store.id)}
                className="text-red-400 text-sm font-medium"
              >
                Delete
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
          </div>
        )}

        <div className="px-6 pb-6 space-y-4 pt-4">
          {/* Add Item Form */}
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <h3 className="font-semibold text-gray-700">Add Item</h3>
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
              placeholder="Item name (e.g. Rice 1kg)"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <input
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
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
              className="w-full border border-green-400 text-green-600 rounded-xl py-2.5 font-semibold text-sm"
            >
              🧾 Scan Receipt Instead
            </button>
          </div>

          {/* Items List */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-700">
              Items{" "}
              <span className="text-gray-400 font-normal">
                ({items.length})
              </span>
            </h3>

            {items.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-3xl mb-2">🛒</p>
                <p className="text-sm">No items yet. Add one above.</p>
              </div>
            )}

            {items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3"
              >
                <div>
                  <p className="font-medium text-gray-800 text-sm">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400">
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
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-300 hover:text-red-500 text-lg leading-none"
                  >
                    &times;
                  </button>
                </div>
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
