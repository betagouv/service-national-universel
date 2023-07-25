import React from "react";
import UploadedFileIcon from "../../../../../assets/icons/UploadedFileIcon";
import Download from "../../../../../assets/icons/Download";
import ReactLoading from "react-loading";

export default function FileInput({ disabled = false, refInput, loading }) {
  return (
    <div className="mt-4 flex w-3/4 flex-col items-center justify-center rounded-md border-[1px] border-dashed border-gray-400 py-4">
      <UploadedFileIcon />
      {loading ? (
        <div className="mt-7 flex h-10 w-5/6 flex-row items-center justify-center gap-2 rounded-md bg-blue-600 py-2 disabled:opacity-50">
          <ReactLoading type="spin" color="#FFFFFF" width={20} height={20} />
        </div>
      ) : (
        <button
          disabled={disabled}
          onClick={() => refInput.current.click()}
          className={`flex w-5/6 flex-row items-center justify-center gap-2 rounded-md bg-blue-600 py-2 disabled:opacity-50 ${
            disabled ? "cursor-default" : "cursor-pointer"
          } mt-7`}>
          <Download className="text-white" />
          <div className="text-white">Téleverser</div>
        </button>
      )}
    </div>
  );
}
