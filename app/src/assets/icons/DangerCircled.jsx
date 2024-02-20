import * as React from "react";
import { HiExclamation } from "react-icons/hi";

const DangerCircled = () => (
  <span className="bg-amber-100 rounded-full p-2">
    <HiExclamation background-color="black" stroke-color="black" stroke-width="1" size={32} className="fill-amber-600 stroke-black" />
  </span>
);

export default DangerCircled;
