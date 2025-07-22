import React from "react";
import Logo from "components/logo";

const Loading = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
      <div className="relative w-[300px] h-[300px]">
        {/* Logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Logo width={300} height={300} className="animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default Loading; 