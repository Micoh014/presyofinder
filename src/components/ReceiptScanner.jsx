import { useState } from "react";
import Tesseract from "tesseract.js";
import { useModalKeyboard } from "../lib/useModalKeyboard";
import Button from "./ui/Button";
import Input from "./ui/Input";

export default function ReceiptScanner({ onItemsFound, onClose }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [items, setItems] = useState([]);
  const [step, setStep] = useState("upload"); // upload → scanning → review

  const modalRef = useModalKeyboard(onClose);

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleScan() {
    if (!image) return;
    setScanning(true);
    setStep("scanning");

    try {
      const result = await Tesseract.recognize(image, "eng", {
        logger: (m) => console.log(m),
      });

      const text = result.data.text;
      const parsed = parseReceiptText(text);
      setItems(parsed);
      setStep("review");
    } catch (err) {
      console.error("Error scanning receipt:", err);
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
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="receipt-title"
        className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center">
          <h2
            id="receipt-title"
            className="text-xl font-bold text-gray-800 dark:text-white"
          >
            🧾 Scan Receipt
          </h2>
          <Button
            variant="ghost"
            onClick={onClose}
            aria-label="Close"
            className="text-2xl p-2 -m-2"
          >
            &times;
          </Button>
        </div>

        {step === "upload" && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Take or upload a receipt photo
              </label>
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                aria-label="Upload receipt photo"
                className="w-full mt-1 text-sm text-gray-500 dark:text-gray-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-600"
              />
            </div>
            {preview && (
              <img
                src={preview}
                alt="Receipt preview"
                className="w-full h-48 object-contain rounded-lg border dark:border-gray-600"
              />
            )}
            <Button
              variant="primary"
              size="lg"
              onClick={handleScan}
              disabled={!image}
              fullWidth
            >
              Scan Receipt
            </Button>
          </div>
        )}

        {step === "scanning" && (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <div className="text-4xl animate-pulse">🧾</div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Reading receipt, please wait...
            </p>
          </div>
        )}

        {step === "review" && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
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
                  <Input
                    id={`receipt-item-name-${index}`}
                    label={`Item ${index + 1} name`}
                    srOnlyLabel
                    value={item.name}
                    onChange={(e) =>
                      handleItemChange(index, "name", e.target.value)
                    }
                    placeholder="Item name"
                  />
                  <Input
                    id={`receipt-item-price-${index}`}
                    label={`Item ${index + 1} price`}
                    srOnlyLabel
                    type="number"
                    value={item.price}
                    onChange={(e) =>
                      handleItemChange(index, "price", e.target.value)
                    }
                    placeholder="Price"
                    className="w-24"
                  />
                  <button
                    onClick={() => handleRemoveItem(index)}
                    aria-label={`Remove item ${index + 1}`}
                    className="text-red-400 text-lg p-2 -m-2"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleAddBlankItem}
              className="w-full border border-dashed border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-lg py-2 text-sm"
            >
              + Add item manually
            </button>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setStep("upload")}
                fullWidth
              >
                Rescan
              </Button>
              <Button
                variant="primary"
                onClick={() =>
                  onItemsFound(items.filter((i) => i.name && i.price))
                }
                fullWidth
              >
                Add to Store
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
