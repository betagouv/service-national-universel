import React from "react";

export default function StatusPill({ status }) {
  if (status && status === "IN_PROGRESS") {
    return <span className="bg-[#2563EB] rounded-full text-xs text-[#D1DAEF] px-2 py-0.5 shadow-sm ml-auto">En cours</span>;
  }
  if (status && status === "EXEMPTED") {
    return <span className="bg-[#1E3A8A] rounded-full text-xs text-[#D1DAEF] px-2 py-0.5 shadow-sm ml-auto">Dispensé</span>;
  }
  return null;
}
