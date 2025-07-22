import React from "react";

import { Oval } from "react-loader-spinner";

const Loader = ({ color = "#342484", size = 100, className = "", secondaryColor = "#ddd" }) => (
  <div className={`flex h-full w-full items-center justify-center ${className}`}>
    <Oval color={color} height={size} width={size} secondaryColor={secondaryColor} />
  </div>
);

export default Loader;
