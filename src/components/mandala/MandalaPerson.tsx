import { User, Users } from "lucide-react";
import React from "react";

interface MandalaPersonProps {
  type?: "CHARACTER" | "OVERLAP";
}

const MandalaPerson: React.FC<MandalaPersonProps> = ({ type = "OVERLAP" }) => {
  const isUnified = type === "OVERLAP";

  return (
    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-60">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
        {isUnified ? (
          <Users className="stroke-primary" />
        ) : (
          <User className="stroke-primary" />
        )}
      </div>
    </div>
  );
};

export default MandalaPerson;
