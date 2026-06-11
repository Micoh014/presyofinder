import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Dashboard({ onClose }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const { data: stores } = await supabase.from("stores").select("*");
    const { data: items } = await supabase
      .from("items")
      .select("*, stores(name)");

    if (!stores || !items) return;

    // Total stores
    const totalStores = stores.length;

    // Total items logged
    const totalItems = items.length;

    // Most logged item
    const itemCounts = {};
    items.forEach((item) => {
      const key = item.name.toLowerCase();
      itemCounts[key] = (itemCounts[key] || 0) + 1;
    });
    const mostLoggedItem = Object.entries(itemCounts).sort(
      (a, b) => b[1] - a[1],
    )[0];

    // Cheapest find per item
    const itemPrices = {};
    items.forEach((item) => {
      const key = item.name.toLowerCase();
      if (!itemPrices[key] || item.price < itemPrices[key].price) {
        itemPrices[key] = {
          price: item.price,
          store: item.stores?.name,
          name: item.name,
        };
      }
    });

    // Recently added stores
    const recentStores = [...stores]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 3);

    // Stale items count
    const staleCount = items.filter((item) => {
      const days =
        (new Date() - new Date(item.recorded_at)) / (1000 * 60 * 60 * 24);
      return days > 30;
    }).length;

    setStats({
      totalStores,
      totalItems,
      mostLoggedItem,
      recentStores,
      staleCount,
      cheapestFinds: Object.values(itemPrices).slice(0, 5),
    });
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 bg-white z-2000 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">📊 Dashboard</h1>
        <button onClick={onClose} className="text-gray-400 text-2xl">
          &times;
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-400">Loading stats...</p>
        </div>
      ) : (
        <div className="px-6 py-4 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-2xl p-4">
              <p className="text-3xl font-bold text-green-600">
                {stats.totalStores}
              </p>
              <p className="text-sm text-gray-500 mt-1">Stores Pinned</p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4">
              <p className="text-3xl font-bold text-blue-600">
                {stats.totalItems}
              </p>
              <p className="text-sm text-gray-500 mt-1">Prices Logged</p>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-4">
              <p className="text-3xl font-bold text-yellow-600">
                {stats.staleCount}
              </p>
              <p className="text-sm text-gray-500 mt-1">Outdated Prices</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-4">
              <p className="text-3xl font-bold text-purple-600">
                {stats.mostLoggedItem ? stats.mostLoggedItem[1] : 0}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Most logged:{" "}
                {stats.mostLoggedItem ? stats.mostLoggedItem[0] : "N/A"}
              </p>
            </div>
          </div>

          {/* Cheapest Finds */}
          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-3">
              💰 Your Cheapest Finds
            </h2>
            {stats.cheapestFinds.length === 0 ? (
              <p className="text-sm text-gray-400">No items logged yet.</p>
            ) : (
              <div className="space-y-2">
                {stats.cheapestFinds.map((find, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-gray-800 capitalize">
                        {find.name}
                      </p>
                      <p className="text-xs text-gray-400">{find.store}</p>
                    </div>
                    <p className="font-bold text-green-600">
                      ₱{parseFloat(find.price).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Stores */}
          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-3">
              📍 Recently Added Stores
            </h2>
            {stats.recentStores.length === 0 ? (
              <p className="text-sm text-gray-400">No stores yet.</p>
            ) : (
              <div className="space-y-2">
                {stats.recentStores.map((store) => (
                  <div
                    key={store.id}
                    className="flex justify-between items-center bg-gray-50 rounded-xl px-4 py-3"
                  >
                    <p className="font-medium text-gray-800">{store.name}</p>
                    <p className="text-xs text-gray-400 capitalize">
                      {store.type}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
