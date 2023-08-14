import React from "react";
import { translate } from "snu-lib";

const PeriodeItem = ({ name, onClick, active }) => {
  return active ? (
    <div
      className="group flex cursor-pointer flex-col items-center justify-center rounded-full border-[1px] border-blue-600 py-1 px-4 text-xs text-blue-600 hover:border-blue-500"
      onClick={() => onClick(name)}>
      <div className="">{translate(name)}</div>
    </div>
  ) : (
    <div
      className="group flex cursor-pointer flex-col items-center justify-center rounded-full border-[1px] border-gray-200 py-1 px-4 text-xs text-gray-700 hover:border-gray-300"
      onClick={() => onClick(name)}>
      <div className="">{translate(name)}</div>
    </div>
  );
};

export default PeriodeItem;
