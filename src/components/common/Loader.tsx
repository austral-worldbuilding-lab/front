import React from "react";

interface LoaderProps {
  size?: "small" | "medium" | "large";
  text?: string;
  showText?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
  size = "medium",
  text = "Cargando...",
  showText = true,
}) => {
  // Class for size
  const sizeClass = {
    small: "w-6 h-6",
    medium: "w-10 h-10",
    large: "w-16 h-16",
  }[size];

  // Border width class
  const borderWidthClass = {
    small: "border-2",
    medium: "border-3",
    large: "border-4",
  }[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative">
        {/* Outer spinning circle */}
        <div
          className={`animate-spin rounded-full ${sizeClass} ${borderWidthClass} border-r-primary border-l-primary`}
          style={{
            borderTopColor: "transparent",
            borderBottomColor: "transparent",
            animationDuration: "1.2s",
          }}
        />

        {/* Inner spinning circle (opposite direction) */}
        <div
          className={`absolute top-0 left-0 animate-spin rounded-full ${sizeClass} ${borderWidthClass} border-t-primary border-b-primary`}
          style={{
            borderRightColor: "transparent",
            borderLeftColor: "transparent",
            animationDuration: "1s",
            animationDirection: "reverse",
            borderWidth: `${parseInt(borderWidthClass.split("-")[1]) - 1}px`,
          }}
        />
      </div>

      {/* Loading text */}
      {showText && <p className="text-sm font-medium text-primary">{text}</p>}
    </div>
  );
};

export default Loader;
