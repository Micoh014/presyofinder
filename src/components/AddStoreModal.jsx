import { useState } from "react";
import { supabase } from "../lib/supabase";
import { showToast } from "../lib/toast";
import Modal from "./ui/Modal";
import Button from "./ui/Button";
import Input from "./ui/Input";

const STORE_TYPES = [
  { value: "sari-sari", label: "🏪 Sari-sari Store" },
  { value: "karinderia", label: "🍚 Karinderia" },
  { value: "palengke", label: "🥬 Palengke" },
  { value: "mall", label: "🏬 Mall" },
  { value: "supermarket", label: "🛒 Supermarket" },
  { value: "street-vendor", label: "🛵 Street Vendor" },
  { value: "online", label: "📦 Online Seller" },
];

export default function AddStoreModal({ position, onSave, onClose }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("sari-sari");
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  async function handleSubmit() {
    if (!name.trim()) return showToast("Please enter a store name.", "error");
    setUploading(true);
    let photo_url = null;

    if (photo) {
      const fileName = `${Date.now()}-${photo.name}`;
      const { error: uploadError } = await supabase.storage
        .from("store-photos")
        .upload(fileName, photo);

      if (uploadError) {
        setUploading(false);
        return showToast(
          "Error uploading photo: " + uploadError.message,
          "error",
        );
      }

      const { data: urlData } = supabase.storage
        .from("store-photos")
        .getPublicUrl(fileName);

      photo_url = urlData.publicUrl;
    }

    setUploading(false);
    onSave({
      name,
      type,
      latitude: position.lat,
      longitude: position.lng,
      photo_url,
    });
  }

  return (
    <Modal
      onClose={onClose}
      labelId="add-store-title"
      className="p-6 space-y-4"
    >
      <div className="w-10 h-1 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto -mt-1 mb-2" />

      <div className="flex justify-between items-center">
        <h2
          id="add-store-title"
          className="text-xl font-bold text-gray-800 dark:text-white"
        >
          📍 Add Store
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

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-40 object-cover rounded-2xl"
          />
          <button
            onClick={() => {
              setPhoto(null);
              setPreview(null);
            }}
            aria-label="Remove photo"
            className="absolute top-2 right-2 bg-black/50 text-white text-sm w-7 h-7 rounded-full flex items-center justify-center"
          >
            &times;
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl cursor-pointer hover:border-green-400 transition-colors">
          <span className="text-3xl mb-1">📷</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Tap to add a store photo
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </label>
      )}

      <Input
        id="store-name"
        label="Store Name"
        placeholder="e.g. Aling Rosa's Store"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div>
        <label className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Store Type
        </label>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {STORE_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setType(t.value)}
              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                type === t.value
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button variant="secondary" onClick={onClose} fullWidth>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={uploading}
          fullWidth
        >
          {uploading ? "Saving..." : "Save Store"}
        </Button>
      </div>
    </Modal>
  );
}
