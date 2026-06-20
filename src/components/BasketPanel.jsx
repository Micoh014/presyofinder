import { supabase } from "../services/supabase";
import Spinner from "./ui/Spinner";
import { ShoppingBasket } from "lucide-react";
import { useState, useEffect, useRef } from "react";

export default function BasketPanel({ onSelectStore, onItemsChange, userId }) {
  const [basketItems, setBasketItems] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bestStore, setBestStore] = useState(null);
  const [itemResults, setItemResults] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    onItemsChange?.(basketItems.length);
  }, [basketItems, onItemsChange]);

  useEffect(() => {
    if (basketItems.length > 0) findCheapest();
  }, [basketItems]);

  useEffect(() => {
    async function loadSuggestions() {
      const { data } = await supabase
        .from("items")
        .select("name")
        .eq("user_id", userId)
        .order("name");
      if (data) {
        const unique = [...new Set(data.map((i) => i.name))];
        setSuggestions(unique);
      }
    }
    if (userId) loadSuggestions();
  }, [userId]);

  const filteredSuggestions = inputValue.trim()
    ? suggestions.filter((s) =>
        s.toLowerCase().includes(inputValue.toLowerCase()),
      )
    : suggestions.slice(0, 8);

  async function findCheapest() {
    if (basketItems.length === 0) {
      setBestStore(null);
      setItemResults([]);
      return;
    }
    setLoading(true);

    const queries = await Promise.all(
      basketItems.map((name) =>
        supabase
          .from("items")
          .select("*, stores(*)")
          .eq("user_id", userId)
          .ilike("name", `%${name}%`)
          .order("price", { ascending: true }),
      ),
    );

    const resolved = basketItems.map((name, i) => {
      const data = queries[i].data || [];
      const storeMap = {};
      data.forEach((item) => {
        const sid = item.store_id;
        if (!storeMap[sid] || item.price < storeMap[sid].price)
          storeMap[sid] = item;
      });
      return {
        name,
        cheapest:
          Object.values(storeMap).sort((a, b) => a.price - b.price)[0] || null,
      };
    });

    setItemResults(resolved);

    const storeScores = {};
    resolved.forEach(({ name, cheapest }) => {
      if (!cheapest) return;
      const sid = cheapest.store_id;
      if (!storeScores[sid]) {
        storeScores[sid] = { store: cheapest.stores, total: 0, count: 0 };
      }
      storeScores[sid].total += parseFloat(cheapest.price);
      storeScores[sid].count += 1;
    });

    const best =
      Object.values(storeScores).sort(
        (a, b) => b.count - a.count || a.total - b.total,
      )[0] || null;

    setBestStore(best);
    setLoading(false);
  }

  function addItem(name) {
    const trimmed = name.trim();
    if (!trimmed || basketItems.includes(trimmed)) return;
    setBasketItems((prev) => [...prev, trimmed]);
    setInputValue("");
    setShowSuggestions(false);
  }

  function removeItem(name) {
    setBasketItems((prev) => prev.filter((i) => i !== name));
  }

  return (
    <div className="flex flex-col h-full">
      <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
        My Grocery Basket
      </p>

      <div className="relative flex gap-2 mb-3 shrink-0">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addItem(inputValue);
            }}
            placeholder="Add an item..."
            className="w-full bg-gray-50 dark:bg-gray-800 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400 placeholder-gray-400 dark:placeholder-gray-500"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
              {filteredSuggestions.map((s) => (
                <button
                  key={s}
                  onMouseDown={() => addItem(s)}
                  className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => addItem(inputValue)}
          className="shrink-0 w-9 h-9 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center text-lg font-bold"
        >
          +
        </button>
      </div>

      <div className="flex-1 overflow-y-auto -mx-4 px-4 space-y-2 min-h-0">
        {basketItems.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center h-full px-6">
            <ShoppingBasket
              size={40}
              strokeWidth={1.5}
              className="text-gray-300 dark:text-gray-600 mb-3"
            />
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300">
              Your basket is empty
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Add grocery items to compare the best nearby prices.
            </p>
          </div>
        )}

        {basketItems.map((name) => {
          const result = itemResults.find((r) => r.name === name);
          const cheapest = result?.cheapest;
          return (
            <div
              key={name}
              className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm p-3"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                  {name}
                </p>
                <button
                  onClick={() => removeItem(name)}
                  className="text-gray-300 dark:text-gray-600 hover:text-red-400 text-base leading-none"
                >
                  ×
                </button>
              </div>
              {cheapest ? (
                <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-green-600 dark:text-green-400 text-xs">
                      🏆
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {cheapest.stores?.name}
                      {cheapest.stores?.distance !== undefined &&
                        ` · ${cheapest.stores.distance < 1000 ? Math.round(cheapest.stores.distance) + "m" : (cheapest.stores.distance / 1000).toFixed(1) + "km"}`}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-green-600 dark:text-green-400 shrink-0 ml-2">
                    ₱{parseFloat(cheapest.price).toFixed(2)}
                  </p>
                </div>
              ) : loading ? (
                <div className="px-3 py-2">
                  <Spinner size="sm" />
                </div>
              ) : (
                <div className="px-3 py-2">
                  <p className="text-xs text-gray-400">No price found nearby</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {bestStore && (
        <div
          onClick={() => onSelectStore(bestStore.store)}
          className="mt-3 shrink-0 bg-green-50 dark:bg-green-900/20 rounded-2xl px-4 py-3 cursor-pointer hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase tracking-widest">
              Best One-Stop Shop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {bestStore.count}/{basketItems.length} items
            </p>
          </div>
          <p className="text-sm font-bold text-gray-800 dark:text-white truncate mb-2">
            {bestStore.store?.name}
          </p>
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Cheapest possible total
            </p>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              ₱{bestStore.total.toFixed(2)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
