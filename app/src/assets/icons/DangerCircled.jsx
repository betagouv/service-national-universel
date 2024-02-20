import * as React from "react";
import { HiExclamation } from "react-icons/hi";

const DangerCircled = ({ size = 32 }) => (
  <span className="bg-amber-100 rounded-full p-2">
    <HiExclamation background-color="black" stroke-color="black" stroke-width="1" size={size} className="fill-amber-600 stroke-black" />
  </span>
);

export default DangerCircled;
