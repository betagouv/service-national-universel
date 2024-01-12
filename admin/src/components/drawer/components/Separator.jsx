import React from "react";

export default function Separator({ open = true }) {
  return <div className={`h-[1px] bg-[#0C1035] mx-auto ${open ? "w-[230px]" : "w-[68px]"}`}></div>;
}
