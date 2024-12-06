import React from "react";
import ReactLoading from "react-loading";

export default function Loader({ size = "3rem" }) {
  return (
    <div className="flex w-full h-full flex-1 justify-center items-center">
      <ReactLoading type="spin" color="#2563eb" width={size} height={size} />
    </div>
  );
}
