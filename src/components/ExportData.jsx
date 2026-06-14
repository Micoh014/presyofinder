import { supabase } from "../lib/supabase";

export default function ExportData({ userId }) {
  async function handleExport() {
    const { data: stores } = await supabase
      .from("stores")
      .select("*")
      .eq("user_id", userId);
    const { data: items } = await supabase
      .from("items")
      .select("*, stores(name)")
      .eq("user_id", userId);

    if (!stores || !items) {
      alert("Failed to fetch data for export.");
      return;
    }

    // Build CSV rows
    const rows = [
      [
        "Store Name",
        "Store Type",
        "Item Name",
        "Price",
        "Date Recorded",
        "Latitude",
        "Longitude",
      ],
    ];

    items.forEach((item) => {
      const store = stores.find((s) => s.id === item.store_id);
      rows.push([
        store?.name || item.stores?.name || "",
        store?.type || "",
        item.name,
        item.price,
        new Date(item.recorded_at).toLocaleDateString("en-PH"),
        store?.latitude || "",
        store?.longitude || "",
      ]);
    });

    // Convert to CSV string
    const csvContent = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    // Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `presyofinder-export-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-full shadow-lg font-medium text-xs border border-gray-100 dark:border-gray-700"
    >
      📥 Export
    </button>
  );
}
