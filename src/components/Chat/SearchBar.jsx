import React from "react";

/**
 * Unified SearchBar component for chat input
 * Used across different chat pages (HR Donna, Gajodhar, etc.)
 */
export default function SearchBar({
  value = "",
  onChange = () => {},
  onSubmit = () => {},
  placeholder = "Type your message...",
  disabled = false,
  isLoading = false,
  onKeyDown = null,
}) {
  const handleKeyDown = (e) => {
    if (onKeyDown) {
      onKeyDown(e);
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={isLoading ? "Please wait for reply..." : placeholder}
      disabled={disabled || isLoading}
      autoFocus
      className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-base bg-white/80 shadow transition-all duration-200"
    />
  );
}
