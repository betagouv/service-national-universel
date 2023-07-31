import React from "react";

const BlueIcon = ({ icon, className }) => (
  <span aria-hidden className={`material-icons flex h-9 w-auto p-2 items-center justify-center rounded-md bg-snu-purple-900 text-white ${className}`}>
    {icon}
  </span>
);

export default BlueIcon;
