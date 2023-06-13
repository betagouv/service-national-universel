import React from "react";

// This button could be a generic button
// It could be named `PrimaryButton` for example
const ContinueButton = ({ children, ...rest }) => {
  return (
    <button
      {...rest}
      className="my-[1rem] block w-auto self-end rounded-md border-none bg-snu-primary-2 py-[10px] px-10 text-sm font-semibold text-white outline-none drop-shadow-md hover:opacity-90 md:my-0">
      {children}
    </button>
  );
};

export default ContinueButton;
