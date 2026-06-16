export default function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  className = "",
  "aria-label": ariaLabel,
  type = "button",
}) {
  const base =
    "font-semibold rounded-xl transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-1";

  const variants = {
    primary: "bg-green-500 text-white hover:bg-green-600 focus:ring-green-400",
    secondary:
      "border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-300",
    danger: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-400",
    ghost:
      "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:ring-gray-300",
    outline:
      "border border-green-400 dark:border-green-500 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 focus:ring-green-400",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-sm",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`
        ${base}
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {children}
    </button>
  );
}
