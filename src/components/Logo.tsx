
import React from "react";

const Logo: React.FC = () => {
  return (
    <div className="flex items-center space-x-2">
      <div className="relative w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
        <div className="absolute w-6 h-6 border-4 border-white rounded-full"></div>
        <div className="absolute w-3 h-3 bg-white rounded-full"></div>
      </div>
      <span className="font-bold text-xl text-teal-800">OvaryCare</span>
    </div>
  );
};

export default Logo;
