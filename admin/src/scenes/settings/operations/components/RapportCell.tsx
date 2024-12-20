import React from "react";
import { downloadSecuredFile } from "@/services/file.service";
import { HiOutlinePaperClip } from "react-icons/hi";

export default function RapportCell(simulation) {
  if (!simulation.metadata?.results?.rapportKey) {
    return null;
  }
  return (
    <button onClick={() => downloadSecuredFile(simulation.metadata?.results?.rapportKey)} className="border-[1px] border-blue-600 rounded-full p-2.5">
      <HiOutlinePaperClip size={24} />
    </button>
  );
}
