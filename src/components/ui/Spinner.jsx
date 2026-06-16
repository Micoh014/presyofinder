export default function Spinner({ size = "md", className = "" }) {
  const sizes = {
    sm: "w-3 h-3 border-2",
    md: "w-5 h-5 border-2",
    lg: "w-8 h-8 border-4",
  };
  return (
    <div
      className={`${sizes[size]} border-green-200 border-t-green-500 rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}
