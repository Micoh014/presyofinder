import { useState } from "react";
import { supabase } from "../lib/supabase";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import Input from "./ui/Input";

export default function Basket({ onClose }) {
  const [basketItems, setBasketItems] = useState([{ name: "" }]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleItemChange(index, value) {
    const updated = [...basketItems];
    updated[index].name = value;
    setBasketItems(updated);
  }

  function handleAddRow() {
    setBasketItems([...basketItems, { name: "" }]);
  }

  function handleRemoveRow(index) {
    setBasketItems(basketItems.filter((_, i) => i !== index));
  }

  async function handleFindCheapest() {
    const names = basketItems.map((i) => i.name.trim()).filter(Boolean);
    if (names.length === 0) return;

    setLoading(true);
    setResults(null);

    const queries = await Promise.all(
      names.map((name) =>
        supabase
          .from("items")
          .select("*, stores(*)")
          .ilike("name", `%${name}%`)
          .order("price", { ascending: true }),
      ),
    );

    const itemResults = names.map((name, i) => {
      const data = queries[i].data || [];
      const storeMap = {};
      data.forEach((item) => {
        const storeId = item.store_id;
        if (!storeMap[storeId] || item.price < storeMap[storeId].price) {
          storeMap[storeId] = item;
        }
      });
      return {
        name,
        options: Object.values(storeMap).sort((a, b) => a.price - b.price),
      };
    });

    const storeScores = {};
    itemResults.forEach((item) => {
      item.options.forEach((option) => {
        const storeId = option.store_id;
        if (!storeScores[storeId]) {
          storeScores[storeId] = {
            store: option.stores,
            total: 0,
            items: [],
            count: 0,
          };
        }
        const already = storeScores[storeId].items.find(
          (i) => i.itemName === item.name,
        );
        if (!already) {
          storeScores[storeId].total += parseFloat(option.price);
          storeScores[storeId].items.push({
            itemName: item.name,
            foundName: option.name,
            price: option.price,
          });
          storeScores[storeId].count += 1;
        }
      });
    });

    const sortedStores = Object.values(storeScores).sort(
      (a, b) => b.count - a.count || a.total - b.total,
    );

    setResults({ itemResults, sortedStores, totalItems: names.length });
    setLoading(false);
  }

  return (
    <Modal
      onClose={onClose}
      labelId="basket-title"
      className="p-6 space-y-4 max-h-[90vh] overflow-y-auto"
    >
      <div className="flex justify-between items-center">
        <h2
          id="basket-title"
          className="text-xl font-bold text-gray-800 dark:text-white"
        >
          🧺 Basket Finder
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

      <p className="text-sm text-gray-500 dark:text-gray-400">
        Enter items you want to buy and find the cheapest store.
      </p>

      <div className="space-y-2">
        {basketItems.map((item, index) => (
          <div key={index} className="flex gap-2 items-center">
            <Input
              id={`basket-item-${index}`}
              label={`Item ${index + 1}`}
              srOnlyLabel
              placeholder={`Item ${index + 1} (e.g. Rice)`}
              value={item.name}
              onChange={(e) => handleItemChange(index, e.target.value)}
            />
            {basketItems.length > 1 && (
              <button
                onClick={() => handleRemoveRow(index)}
                aria-label={`Remove item ${index + 1}`}
                className="text-red-400 text-lg p-2 -m-2"
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleAddRow}
        className="w-full border border-dashed border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-lg py-2 text-sm"
      >
        + Add another item
      </button>

      <Button
        variant="primary"
        onClick={handleFindCheapest}
        disabled={loading}
        fullWidth
        size="lg"
      >
        {loading ? "Searching..." : "🔍 Find Cheapest Store"}
      </Button>

      {results && (
        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-gray-700 dark:text-gray-200">
            Results
          </h3>

          {results.sortedStores.length === 0 ? (
            <p className="text-sm text-orange-400">
              ⚠️ No stores found with these items.
            </p>
          ) : (
            results.sortedStores.map((storeResult, i) => (
              <div
                key={i}
                className={`rounded-xl border p-4 space-y-2 ${i === 0 ? "border-green-400 bg-green-50 dark:bg-green-900/30" : "border-gray-200 dark:border-gray-600"}`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-bold text-gray-800 dark:text-white">
                      {storeResult.store?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                      {storeResult.store?.type}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 dark:text-green-400 text-lg">
                      ₱{storeResult.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {storeResult.count}/{results.totalItems} items
                    </p>
                  </div>
                </div>

                {i === 0 && (
                  <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                    ⭐ Best option
                  </p>
                )}

                <div className="space-y-1">
                  {storeResult.items.map((item, j) => (
                    <div key={j} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">
                        {item.foundName}
                      </span>
                      <span className="text-gray-800 dark:text-gray-100 font-medium">
                        ₱{parseFloat(item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Modal>
  );
}
