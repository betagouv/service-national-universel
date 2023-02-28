import React from "react";

const ContinueButton = ({ children, ...rest }) => {
  return (
    <button
      {...rest}
      className="text-white bg-snu-primary-2 py-[10px] px-10 border-none outline-none rounded-md font-semibold text-sm block w-auto drop-shadow-md self-end hover:opacity-90 my-[1rem] md:my-0">
      {children}
    </button>
  );
};

export default ContinueButton;
