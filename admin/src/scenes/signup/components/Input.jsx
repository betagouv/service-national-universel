import React from "react";
import ErrorMessage from "@/components/dsfr/forms/ErrorMessage";

export default function Input({ value, placeholder = "", label, onChange, type = "text", error = "", className = "", correction = "", list = "" }) {
  return (
    <div className={`mt-2 mb-4 ${className}`}>
      <label className={`my-2 whitespace-nowrap ${correction || error ? "text-[#CE0500]" : "text-[#3A3A3A]"}`}>{label}</label>
      <input
        list={list}
        className={`flex w-full items-center justify-between gap-3 border-b-[2px] bg-[#EEEEEE] px-4 py-2 ${
          correction || error ? "border-[#CE0500]" : "border-[#3A3A3A]"
        } rounded-t-[4px]`}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />

      <ErrorMessage>{error}</ErrorMessage>
      <ErrorMessage>{correction}</ErrorMessage>
    </div>
  );
}
