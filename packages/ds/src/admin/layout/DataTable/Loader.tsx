import React from "react";
import { CgSpinner } from "react-icons/cg";

export default function Loader({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 mb-2 text-gray-500">
      <CgSpinner size={20} className="animate-spin" />
      {label || "Chargement en cours...."}
    </div>
  );
}
