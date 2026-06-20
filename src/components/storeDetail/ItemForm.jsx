import { useState, useRef } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { Receipt } from "lucide-react";

export default function ItemForm({ onAdd, onScanReceipt, frequentItems = [] }) {
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const priceRef = useRef(null);

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

  function handleChipTap(name) {
    setItemName(name);
    // Focus price field so user can type price immediately
    setTimeout(() => priceRef.current?.focus(), 50);
  }

  async function handleKeyDown(e) {
    if (e.key === "Enter" && itemName.trim() && itemPrice) {
      await handleAdd();
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 space-y-3">
      {/* Quick add chips */}
      {frequentItems.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">
            Quick Add
          </p>
          <div
            className="flex gap-2 overflow-x-auto pb-1"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {frequentItems.map((name) => (
              <button
                key={name}
                onClick={() => handleChipTap(name)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                  itemName === name
                    ? "bg-green-500 text-white border-green-500"
                    : "bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-200 border-gray-200 dark:border-gray-500 hover:border-green-400 hover:text-green-600"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Name field */}
      <Input
        id="item-name"
        label="Item name"
        srOnlyLabel
        type="number"
        placeholder="Item name (e.g. Rice 1kg)"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        onKeyDown={handleKeyDown}
        inputRef={priceRef}
      />

      {/* Price field */}
      <div ref={priceRef}>
        <Input
          id="item-price"
          label="Item price in pesos"
          srOnlyLabel
          type="number"
          placeholder="Price (e.g. 52.00)"
          value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={onScanReceipt} fullWidth>
          <span className="flex items-center justify-center gap-1.5">
            <Receipt size={15} /> Scan Receipt
          </span>
        </Button>
        <Button
          variant="primary"
          onClick={handleAdd}
          disabled={loading}
          fullWidth
        >
          {loading ? "Saving..." : "+ Add Item"}
        </Button>
      </div>
    </div>
  );
}
