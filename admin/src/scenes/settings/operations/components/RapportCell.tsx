import React from "react";
import { downloadSecuredFile } from "@/services/file.service";
import { HiOutlinePaperClip, HiDocumentReport } from "react-icons/hi";
import { Link } from "react-router-dom";
import { TaskName } from "snu-lib";

export default function RapportCell(simulation) {
  if (!simulation.metadata?.results?.rapportKey) {
    return null;
  }
  return (
    <div className="flex gap-2">
      <button onClick={() => downloadSecuredFile(simulation.metadata?.results?.rapportKey)} className="border-[1px] border-blue-600 rounded-full p-2.5">
        <HiOutlinePaperClip size={24} />
      </button>
      {simulation.name === TaskName.AFFECTATION_HTS_SIMULATION && (
        <Link target="_blank" to={`/settings/operations/simulation/rapport-pdf/${simulation.id}`} className="border-[1px] border-blue-600 rounded-full p-2.5">
          <HiDocumentReport size={24} />
        </Link>
      )}
    </div>
  );
}
