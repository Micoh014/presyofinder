import { useState, useCallback } from "react";
import { motion } from "framer-motion";

import { useModalKeyboard } from "../services/useModalKeyboard";

import { useItems } from "../hooks/useItems";
import { useFrequentItems } from "../hooks/useFrequentItems";

import StoreHeader from "./storeDetail/StoreHeader";
import ItemForm from "./storeDetail/ItemForm";
import ItemList from "./storeDetail/ItemList";
import ReceiptScanner from "./ReceiptScanner";

import Spinner from "./ui/Spinner";
import EmptyState from "./ui/EmptyState";

export default function StoreDetail({ store, onClose, onDelete, userId }) {
  const [showScanner, setShowScanner] = useState(false);
  const modalRef = useModalKeyboard(onClose);
  const {
    items,
    itemsLoading,
    itemsError,
    addItem,
    updateItem,
    deleteItem,
    addItemsBatch,
  } = useItems(store.id, userId);

  // Stable reference — ReceiptScanner won't re-render when unrelated state changes
  const handleReceiptItems = useCallback(
    async (scannedItems) => {
      await addItemsBatch(scannedItems);
      setShowScanner(false);
    },
    [addItemsBatch],
  );

  const handleOpenScanner = useCallback(() => setShowScanner(true), []);
  const handleCloseScanner = useCallback(() => setShowScanner(false), []);
  const { frequentItems } = useFrequentItems(userId);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-3000">
      <motion.div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="store-detail-title"
        className="bg-white dark:bg-gray-800 w-full max-w-md rounded-t-3xl max-h-[85vh] overflow-y-auto"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <StoreHeader store={store} onClose={onClose} onDelete={onDelete} />

        <div className="px-6 pb-6 space-y-4 pt-4">
          <ItemForm
            onAdd={addItem}
            onScanReceipt={handleOpenScanner}
            frequentItems={frequentItems}
          />

          {itemsLoading && (
            <p className=" text-center py-4">
              <Spinner />
            </p>
          )}

          {itemsError && !itemsLoading && (
            <div className="bg-red-50 dark:bg-red-900/30 rounded-xl px-4 py-3 text-sm text-red-500 dark:text-red-400">
              {itemsError}
            </div>
          )}

          {!itemsLoading && !itemsError && items.length === 0 && (
            <EmptyState description="No items yet - add one below." />
          )}

          <ItemList items={items} onUpdate={updateItem} onDelete={deleteItem} />
        </div>
      </motion.div>

      {showScanner && (
        <ReceiptScanner
          onItemsFound={handleReceiptItems}
          onClose={handleCloseScanner}
        />
      )}
    </div>
  );
}
