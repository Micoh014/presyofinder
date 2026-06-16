import { useState } from "react";

export default function ItemForm({ onAdd, onScanReceipt }) {
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAdd() {
    if (!itemName.trim()) return;
    if (!itemPrice || isNaN(itemPrice)) return;
    setLoading(true);
    const success = await onAdd(itemName, itemPrice);
    if (success) {
      setItemName("");
      setItemPrice("");
    }
    setLoading(false);
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 space-y-3">
      <h3 className="font-semibold text-gray-700 dark:text-gray-200">
        Add Item
      </h3>
      <label htmlFor="item-name" className="sr-only">
        Item name
      </label>
      <input
        id="item-name"
        className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
        placeholder="Item name (e.g. Rice 1kg)"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
      />
      <label htmlFor="item-price" className="sr-only">
        Item price in pesos
      </label>
      <input
        id="item-price"
        className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 text-sm"
        placeholder="Price (e.g. 52.00)"
        type="number"
        value={itemPrice}
        onChange={(e) => setItemPrice(e.target.value)}
      />
      <button
        onClick={handleAdd}
        disabled={loading}
        className="w-full bg-green-500 text-white rounded-xl py-2.5 font-semibold text-sm disabled:opacity-50"
      >
        {loading ? "Saving..." : "+ Add Item"}
      </button>
      <button
        onClick={onScanReceipt}
        className="w-full border border-green-400 dark:border-green-500 text-green-600 dark:text-green-400 rounded-xl py-2.5 font-semibold text-sm"
      >
        🧾 Scan Receipt Instead
      </button>
    </div>
  );
}
