import React from "react";
import ErrorMessage from "./ErrorMessage";

export default function Textarea({ label, value, onChange, rows = 5, error = "", correction = "" }) {
  return (
    <div className="my-6 text-[#161616]">
      <label className={`w-full my-2 ${correction || error ? "text-[#CE0500]" : "text-[#161616]}"}`}>
        {label}
        <textarea
          className={`flex w-full items-center justify-between gap-3 border-b-[2px] bg-[#EEEEEE] mt-2 px-4 py-2 ${
            correction || error ? "border-[#CE0500]" : "border-[#3A3A3A]"
          } rounded-t-[4px]`}
          style={{ fontFamily: "Marianne" }}
          name={label}
          value={value}
          onChange={onChange}
          rows={rows}
        />
      </label>
      <ErrorMessage>{error}</ErrorMessage>
      <ErrorMessage>{correction}</ErrorMessage>
    </div>
  );
}
