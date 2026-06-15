import { useState } from "react";

const SLIDES = [
  {
    icon: "📍",
    title: "Drop Pins Anywhere",
    description:
      'Tap anywhere on the map or use "+ Drop Pin" to mark a store, sari-sari, palengke, or any place you shop.',
  },
  {
    icon: "🧾",
    title: "Log Prices & Scan Receipts",
    description:
      "Add items and prices manually, or scan a receipt photo to auto-fill items.",
  },
  {
    icon: "🔍",
    title: "Search & Compare",
    description:
      "Search any item to see where it's cheapest, sort by price or distance, and find the best deals near you.",
  },
];

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0);

  function handleNext() {
    if (step < SLIDES.length - 1) {
      setStep(step + 1);
    } else {
      onDone();
    }
  }

  const slide = SLIDES[step];

  return (
    <div className="fixed inset-0 bg-white dark:bg-gray-900 flex flex-col items-center justify-center px-8 z-9999">
      <div className="text-6xl mb-6">{slide.icon}</div>
      <h2 className="text-xl font-bold text-gray-800 dark:text-white text-center mb-2">
        {slide.title}
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 text-center max-w-sm mb-8">
        {slide.description}
      </p>

      <div className="flex gap-2 mb-8">
        {SLIDES.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-colors ${
              i === step ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
            }`}
          />
        ))}
      </div>

      <div className="flex gap-3 w-full max-w-sm">
        {step < SLIDES.length - 1 && (
          <button
            onClick={onDone}
            className="flex-1 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-xl py-3 font-semibold text-sm"
          >
            Skip
          </button>
        )}
        <button
          onClick={handleNext}
          className="flex-1 bg-green-500 text-white rounded-xl py-3 font-semibold text-sm"
        >
          {step < SLIDES.length - 1 ? "Next" : "Get Started"}
        </button>
      </div>
    </div>
  );
}
