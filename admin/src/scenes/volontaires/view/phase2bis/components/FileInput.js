import React from "react";
import Cni from "../../../../../assets/icons/Cni";
import Download from "../../../../../assets/icons/Download";

export default function FileInput({ disabled = false, refInput }) {
  return (
    <div className="w-3/4 border-[1px] py-4 mt-4 rounded-md border-dashed border-gray-400 flex items-center justify-center flex-col">
      <Cni />
      <button
        disabled={disabled}
        onClick={() => refInput.current.click()}
        className={`flex flex-row bg-blue-600 w-5/6 items-center justify-center gap-2 rounded-md py-2 disabled:opacity-50 ${disabled ? "cursor-default" : "cursor-pointer"} mt-7`}>
        <Download className="text-white" />
        <div className="text-white">Importer</div>
      </button>
    </div>
  );
}
