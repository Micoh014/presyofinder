import { useState } from "react";
import { supabase } from "../services/supabase";
import Button from "./ui/Button";
import Input from "./ui/Input";
import Spinner from "./ui/Spinner";

export default function BasketPanel({ onSelectStore }) {
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
    <div className="w-full bg-white dark:bg-gray-800 rounded-l overflow-hidden">
      {/* Input section */}
      <div className="p-4 space-y-3">
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
                  className="text-red-400 text-xl p-1 shrink-0"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleAddRow}
          className="w-full border border-dashed border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500 rounded-xl py-2 text-sm hover:border-green-400 hover:text-green-500 transition-colors"
        >
          + Add item
        </button>

        <Button
          variant="primary"
          onClick={handleFindCheapest}
          disabled={loading}
          fullWidth
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Spinner
                size="sm"
                className="border-white border-t-transparent"
              />
              Searching...
            </span>
          ) : (
            "🔍 Find Cheapest Store"
          )}
        </Button>
      </div>

      {/* Results */}
      {results && (
        <div className="border-t border-gray-100 dark:border-gray-700 max-h-64 overflow-y-auto">
          {results.sortedStores.length === 0 ? (
            <p className="text-sm text-orange-400 text-center py-4 px-4">
              ⚠️ No stores found with these items.
            </p>
          ) : (
            <div className="p-3 space-y-2">
              {results.sortedStores.map((storeResult, i) => (
                <button
                  key={i}
                  onClick={() => onSelectStore(storeResult.store)}
                  className={`w-full rounded-xl border p-3 text-left transition-colors hover:opacity-90 ${
                    i === 0
                      ? "border-green-400 bg-green-50 dark:bg-green-900/30"
                      : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <p className="font-bold text-gray-800 dark:text-white text-sm">
                        {i === 0 && "⭐ "}
                        {storeResult.store?.name}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {storeResult.store?.type}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600 dark:text-green-400">
                        ₱{storeResult.total.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {storeResult.count}/{results.totalItems} items
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                    {storeResult.items.map((item, j) => (
                      <span
                        key={j}
                        className="text-xs text-gray-500 dark:text-gray-400"
                      >
                        {item.foundName} ₱{parseFloat(item.price).toFixed(2)}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
