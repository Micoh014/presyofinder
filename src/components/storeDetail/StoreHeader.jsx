import { useState } from "react";
import { supabase } from "../../services/supabase";
import { showToast } from "../../services/toast";
import Button from "../ui/Button";
import Input from "../ui/Input";

const STORE_ICONS = {
  "sari-sari": "🏪",
  karinderia: "🍚",
  palengke: "🥬",
  mall: "🏬",
  supermarket: "🛒",
  "street-vendor": "🛵",
  online: "📦",
};

const STORE_TYPES = [
  { value: "sari-sari", label: "🏪 Sari-sari Store" },
  { value: "karinderia", label: "🍚 Karinderia" },
  { value: "palengke", label: "🥬 Palengke" },
  { value: "mall", label: "🏬 Mall" },
  { value: "supermarket", label: "🛒 Supermarket" },
  { value: "street-vendor", label: "🛵 Street Vendor" },
  { value: "online", label: "📦 Online Seller" },
];

export default function StoreHeader({ store, onClose, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(store.name);
  const [editType, setEditType] = useState(store.type);

  async function handleUpdateStore() {
    if (!editName.trim())
      return showToast("Store name cannot be empty.", "error");
    const { error } = await supabase
      .from("stores")
      .update({ name: editName, type: editType })
      .eq("id", store.id);
    if (error)
      return showToast("Error updating store: " + error.message, "error");
    store.name = editName;
    store.type = editType;
    setEditing(false);
    showToast("Store updated!", "success");
  }

  if (store.photo_url) {
    return (
      <div className="relative">
        <img
          src={store.photo_url}
          alt={store.name}
          className="w-full h-44 object-cover rounded-t-3xl"
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent rounded-t-3xl" />
        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
          <div>
            <h2
              id="store-detail-title"
              className="text-xl font-bold text-white"
            >
              {STORE_ICONS[store.type] || "📍"} {store.name}
            </h2>
            <p className="text-sm text-white/70 capitalize">{store.type}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onDelete(store.id)}
              aria-label="Delete store"
              className="bg-red-500/80 text-white text-xs px-3 py-1 rounded-full"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="bg-white/20 text-white text-xl w-8 h-8 rounded-full flex items-center justify-center"
            >
              &times;
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-6 pb-2">
      {editing ? (
        <div className="space-y-3">
          <Input
            id="edit-store-name"
            label="Store name"
            srOnlyLabel
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <select
            className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            value={editType}
            onChange={(e) => setEditType(e.target.value)}
            aria-label="Store type"
          >
            {STORE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditing(false)}
              fullWidth
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpdateStore}
              fullWidth
            >
              Save
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start">
          <div>
            <h2
              id="store-detail-title"
              className="type-heading text-gray-800 dark:text-white"
            >
              {STORE_ICONS[store.type] || "📍"} {store.name}
            </h2>
            <p className="text-caption text-gray-500 dark:text-gray-400 capitalize">
              {store.type}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(true)}
              aria-label="Edit store"
              className="text-blue-400 dark:text-blue-300"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(store.id)}
              aria-label="Delete store"
              className="text-red-400 dark:text-red-300"
            >
              Delete
            </Button>
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-gray-400 dark:text-gray-500 text-2xl leading-none p-2 -m-2"
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
