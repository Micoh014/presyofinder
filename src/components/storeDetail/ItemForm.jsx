import { useState } from "react";
import Input from "../ui/Input";
import Button from "../ui/Button";

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
      <Input
        id="item-name"
        label="Item name"
        srOnlyLabel
        placeholder="Item name (e.g. Rice 1kg)"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
      />
      <Input
        id="item-price"
        label="Item price in pesos"
        srOnlyLabel
        type="number"
        placeholder="Price (e.g. 52.00)"
        value={itemPrice}
        onChange={(e) => setItemPrice(e.target.value)}
      />
      <Button
        variant="primary"
        onClick={handleAdd}
        disabled={loading}
        fullWidth
      >
        {loading ? "Saving..." : "+ Add Item"}
      </Button>
      <Button variant="outline" onClick={onScanReceipt} fullWidth>
        🧾 Scan Receipt Instead
      </Button>
    </div>
  );
}
