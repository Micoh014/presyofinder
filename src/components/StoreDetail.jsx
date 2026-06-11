import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function StoreDetail({ store, onClose, onDelete }) {
  const [items, setItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [loading, setLoading] = useState(false);

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
  const STORE_ICONS = {
    "sari-sari": "🏪",
    karinderia: "🍚",
    palengke: "🥬",
    mall: "🏬",
    supermarket: "🛒",
    "street-vendor": "🛵",
    online: "📦",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-1000">
      <div className="bg-white w-full max-w-md rounded-t-2xl p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              {STORE_ICONS[store.type] || "📍"} {store.name}
            </h2>
            <p className="text-sm text-gray-500 capitalize">{store.type}</p>
          </div>

          {store.photo_url && (
            <img
              src={store.photo_url}
              alt={store.name}
              className="w-full h-40 object-cover rounded-xl"
            />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDelete(store.id)}
              className="text-red-400 hover:text-red-600 text-sm font-medium"
            >
              Delete Store
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 text-2xl leading-none"
            >
              &times;
            </button>
          </div>
        </div>

        {/* Add Item Form */}
        <div className="border border-gray-200 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-gray-700">Add Item</h3>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Item name (e.g. Rice 1kg)"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          />
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="Price (e.g. 52.00)"
            type="number"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
          />
          <button
            onClick={handleAddItem}
            disabled={loading}
            className="w-full bg-green-500 text-white rounded-lg py-2 font-medium disabled:opacity-50"
          >
            {loading ? "Saving..." : "Add Item"}
          </button>
        </div>

        {/* Items List */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700">
            Items ({items.length})
          </h3>
          {items.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">
              No items yet. Add one above.
            </p>
          )}
          {items.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center border border-gray-100 rounded-lg px-4 py-3"
            >
              <span className="text-gray-800">{item.name}</span>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="font-bold text-green-600">
                    ₱{parseFloat(item.price).toFixed(2)}
                  </span>
                  <p className="text-xs text-gray-400">
                    {new Date(item.recorded_at).toLocaleDateString("en-PH")}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-red-400 hover:text-red-600 text-lg leading-none"
                >
                  &times;
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
