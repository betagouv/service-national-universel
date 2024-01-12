import React from "react";
import { IoIosInformation } from "react-icons/io";

const Alert = ({ children, className }) => (
  <div className={`flex items-stretch border-[1px] border-blue-france-info ${className}`}>
    <div className="bg-blue-france-info px-2 py-3.5">
      <IoIosInformation className="align-top text-blue-france-info bg-white rounded-sm text-xl"></IoIosInformation>
    </div>
    <div className="p-3">{children}</div>
  </div>
);

export default Alert;
