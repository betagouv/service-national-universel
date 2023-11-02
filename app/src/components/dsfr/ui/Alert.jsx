import React from "react";
import { IoIosInformation } from "react-icons/io";

const Alert = ({ children, className }) => (
  <div className={`flex items-stretch border-2 border-blue-france-info ${className}`}>
    <div className="bg-blue-france-info px-3 py-3">
      <IoIosInformation className="align-top text-blue-france-info bg-white rounded"></IoIosInformation>
    </div>
    <div className="p-2">{children}</div>
  </div>
);

export default Alert;
