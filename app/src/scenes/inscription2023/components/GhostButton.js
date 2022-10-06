import React from "react";

const GhostButton = ({ onClick, name, type = undefined }) => {
  return (
    <button className="mt-2 mb-6 max-w-md bg-white w-full py-2 border !border-[#000091] shadow-sm text-[#000091] font-medium" type={type} onClick={onClick}>
      {name}
    </button>
  );
};

export default GhostButton;
