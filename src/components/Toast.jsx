import { useState, useEffect } from "react";
import { subscribeToast } from "../lib/toast";

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsubscribe = subscribeToast((toast) => {
      setToasts((prev) => [...prev, toast]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));
      }, 3000);
    });
    return unsubscribe;
  }, []);

  const styles = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-gray-800",
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-9999 flex flex-col gap-2 items-center pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`${styles[toast.type] || styles.info} text-white text-sm px-4 py-2.5 rounded-xl shadow-lg animate-fade-in max-w-[90vw] text-center`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
