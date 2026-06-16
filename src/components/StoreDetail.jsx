import { useState } from "react";
import { useModalKeyboard } from "../lib/useModalKeyboard";
import { useItems } from "../hooks/useItems";
import StoreHeader from "./storeDetail/StoreHeader";
import ItemForm from "./storeDetail/ItemForm";
import ItemList from "./storeDetail/ItemList";
import ReceiptScanner from "./ReceiptScanner";

export default function StoreDetail({ store, onClose, onDelete, userId }) {
  const [showScanner, setShowScanner] = useState(false);
  const modalRef = useModalKeyboard(onClose);
  const { items, addItem, updateItem, deleteItem, addItemsBatch } = useItems(
    store.id,
    userId,
  );

  async function handleReceiptItems(scannedItems) {
    await addItemsBatch(scannedItems);
    setShowScanner(false);
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-1000">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-detail-title"
        className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl max-h-[85vh] overflow-y-auto"
      >
        <StoreHeader store={store} onClose={onClose} onDelete={onDelete} />

        <div className="px-6 pb-6 space-y-4 pt-4">
          <ItemForm
            onAdd={addItem}
            onScanReceipt={() => setShowScanner(true)}
          />
          <ItemList items={items} onUpdate={updateItem} onDelete={deleteItem} />
        </div>
      </div>

      {showScanner && (
        <ReceiptScanner
          onItemsFound={handleReceiptItems}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
}
