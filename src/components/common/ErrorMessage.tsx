import React from "react";

interface ErrorMessageProps {
  message?: string | null;
}

/**
 * Componente para mostrar mensajes de error
 */
const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  if (!message) return null;

  return (
    <p className="text-red-500 text-sm mt-4 text-center max-w-md">{message}</p>
  );
};

export default ErrorMessage;
