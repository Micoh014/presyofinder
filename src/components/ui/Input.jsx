export default function Input({
  id,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  srOnlyLabel = false,
  className = "",
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className={
            srOnlyLabel
              ? "sr-only"
              : "text-sm font-medium text-gray-600 dark:text-gray-300 block mb-1"
          }
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-400 text-sm ${className}`}
      />
    </div>
  );
}
