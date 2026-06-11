import { useState } from "react";
import { supabase } from "../lib/supabase";

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
    if (!name.trim()) return alert("Please enter a store name.");

    setUploading(true);
    let photo_url = null;

    if (photo) {
      const fileName = `${Date.now()}-${photo.name}`;
      const { error: uploadError } = await supabase.storage
        .from("store-photos")
        .upload(fileName, photo);

      if (uploadError) {
        setUploading(false);
        return alert("Error uploading photo: " + uploadError.message);
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
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[1000]">
      <div className="bg-white w-full max-w-md rounded-t-2xl p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Add Store</h2>

        <div>
          <label className="text-sm text-gray-600">Store Name</label>
          <input
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
            placeholder="e.g. Aling Rosa's Store"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm text-gray-600">Store Type</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-green-400"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {STORE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm text-gray-600">
            Store Photo (optional)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="w-full mt-1 text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-green-50 file:text-green-600"
          />
          {preview && (
            <img
              src={preview}
              alt="Preview"
              className="mt-2 w-full h-40 object-cover rounded-lg"
            />
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="flex-1 bg-green-500 text-white rounded-lg py-2 font-medium disabled:opacity-50"
          >
            {uploading ? "Saving..." : "Save Store"}
          </button>
        </div>
      </div>
    </div>
  );
}
