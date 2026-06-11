import { useState } from "react";
import Tesseract from "tesseract.js";

export default function ReceiptScanner({ onItemsFound, onClose }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [rawText, setRawText] = useState("");
  const [items, setItems] = useState([]);
  const [step, setStep] = useState("upload"); // upload → scanning → review

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleScan() {
    if (!image) return alert("Please select a receipt photo first.");
    setScanning(true);
    setStep("scanning");

    try {
      const result = await Tesseract.recognize(image, "eng", {
        logger: (m) => console.log(m),
      });

      const text = result.data.text;
      setRawText(text);
      const parsed = parseReceiptText(text);
      setItems(parsed);
      setStep("review");
    } catch (err) {
      alert("Error scanning receipt: " + err.message);
      setStep("upload");
    }

    setScanning(false);
  }

  function parseReceiptText(text) {
    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const results = [];

    for (const line of lines) {
      // Match lines like "Item Name 52.00" or "Item Name P52.00"
      const match = line.match(/^(.+?)\s+[₱P]?\s*(\d+[\.,]\d{2})\s*$/);
      if (match) {
        const name = match[1].trim();
        const price = parseFloat(match[2].replace(",", "."));
        if (name.length > 1 && price > 0) {
          results.push({ name, price });
        }
      }
    }

    return results;
  }

  function handleItemChange(index, field, value) {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  }

  function handleRemoveItem(index) {
    setItems(items.filter((_, i) => i !== index));
  }

  function handleAddBlankItem() {
    setItems([...items, { name: "", price: "" }]);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-1000">
      <div className="bg-white w-full max-w-md rounded-t-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">🧾 Scan Receipt</h2>
          <button onClick={onClose} className="text-gray-400 text-2xl">
            &times;
          </button>
        </div>

        {step === "upload" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600">
                Take or upload a receipt photo
              </label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="w-full mt-1 text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-600"
              />
            </div>
            {preview && (
              <img
                src={preview}
                alt="Receipt"
                className="w-full h-48 object-contain rounded-lg border"
              />
            )}
            <button
              onClick={handleScan}
              disabled={!image}
              className="w-full bg-green-500 text-white rounded-lg py-3 font-medium disabled:opacity-50"
            >
              Scan Receipt
            </button>
          </div>
        )}

        {step === "scanning" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="text-4xl animate-pulse">🧾</div>
            <p className="text-gray-500 text-sm">
              Reading receipt, please wait...
            </p>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              {items.length} item{items.length !== 1 ? "s" : ""} found. Edit if
              needed.
            </p>

            {items.length === 0 && (
              <p className="text-sm text-orange-400">
                ⚠️ No items detected. Try a clearer photo or add items manually
                below.
              </p>
            )}

            <div className="space-y-2">
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <input
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(index, "name", e.target.value)
                    }
                    placeholder="Item name"
                  />
                  <input
                    className="w-24 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(index, "price", e.target.value)
                    }
                    placeholder="Price"
                    type="number"
                  />
                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-400 text-lg"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddBlankItem}
              className="w-full border border-dashed border-gray-300 text-gray-400 rounded-lg py-2 text-sm"
            >
              + Add item manually
            </button>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep("upload")}
                className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 font-medium"
              >
                Rescan
              </button>
              <button
                onClick={() =>
                  onItemsFound(items.filter((i) => i.name && i.price))
                }
                className="flex-1 bg-green-500 text-white rounded-lg py-2 font-medium"
              >
                Add to Store
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
