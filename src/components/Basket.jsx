import { useState } from "react";
import { supabase } from "../lib/supabase";

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
    if (names.length === 0) return alert("Please enter at least one item.");

    setLoading(true);
    setResults(null);

    // Fetch all matching items with store info
    const queries = await Promise.all(
      names.map((name) =>
        supabase
          .from("items")
          .select("*, stores(*)")
          .ilike("name", `%${name}%`)
          .order("price", { ascending: true }),
      ),
    );

    // For each searched item, get the cheapest option per store
    const itemResults = names.map((name, i) => {
      const data = queries[i].data || [];
      // Get cheapest per store
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

    // Find best single store (covers most items at lowest total)
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
        // Only add cheapest price per item per store
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
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-1000">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            🧺 Basket Finder
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 text-2xl"
          >
            &times;
          </button>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter items you want to buy and find the cheapest store.
        </p>

        {/* Item Inputs */}
        <div className="space-y-2">
          {basketItems.map((item, index) => (
            <div key={index} className="flex gap-2 items-center">
              <input
                className="flex-1 border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
                placeholder={`Item ${index + 1} (e.g. Rice)`}
                value={item.name}
                onChange={(e) => handleItemChange(index, e.target.value)}
              />
              {basketItems.length > 1 && (
                <button
                  onClick={() => handleRemoveRow(index)}
                  className="text-red-400 text-lg"
                >
                  &times;
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleAddRow}
          className="w-full border border-dashed border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 rounded-lg py-2 text-sm"
        >
          + Add another item
        </button>

        <button
          onClick={handleFindCheapest}
          disabled={loading}
          className="w-full bg-green-500 text-white rounded-lg py-3 font-medium disabled:opacity-50"
        >
          {loading ? "Searching..." : "🔍 Find Cheapest Store"}
        </button>

        {/* Results */}
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
                      <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                        {storeResult.store?.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 dark:text-green-400 text-lg">
                        ₱{storeResult.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {storeResult.count}/{results.totalItems} items
                      </p>
                    </div>
                  </div>

                  {i === 0 && (
                    <p className="text-xs text-green-600 font-medium">
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
      </div>
    </div>
  );
}
