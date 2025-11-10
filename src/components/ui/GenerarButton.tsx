import React from "react";
import { Sparkles } from "lucide-react";

interface GenerarButtonProps {
  text: string;
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

const GenerarButton: React.FC<GenerarButtonProps> = ({
  text,
  loading = false,
  disabled = false,
  onClick,
  className = "",
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold shadow-md transition-all text-white text-base min-h-[40px] min-w-[140px] ${className}` +
        " bg-gradient-to-r from-[#172187] to-[#3b82f6] hover:opacity-90 disabled:opacity-60"}
      style={{
        backgroundImage:
          "linear-gradient(90deg, #172187 0%, #3b82f6 100%)",
      }}
    >
      <Sparkles className="w-5 h-5 mr-1" />
      {loading ? "Generando..." : text}
    </button>
  );
};

export default GenerarButton;
