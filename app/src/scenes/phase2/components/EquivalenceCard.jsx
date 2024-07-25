import React from "react";
import { Link } from "react-router-dom";
import IconDomain from "@/scenes/missions/components/IconDomain";
import { EQUIVALENCE_STATUS } from "snu-lib";
import EquivalenceStatusBadge from "./EquivalenceStatusBadge";

export default function EquivalenceCard({ equivalence }) {
  return (
    <Link to={`/phase2/equivalence/${equivalence._id}`} className="bg-white rounded-xl border w-72 md:w-96 w-full only:md:w-96 flex-none snap-always snap-center shadow-sm">
      <p className="h-8 p-2 text-xs bg-gray-50 border-b-[1px] rounded-t-xl text-gray-800">✏️ Vous avez ajouté cet engagement</p>

      <div className="h-40 p-3 flex flex-col justify-between">
        <EquivalenceStatusBadge status={equivalence.status} />
        <p className="text-xs leading-5 text-gray-500">{equivalence.structureName}</p>

        <div className="flex items-center gap-4">
          <IconDomain domain={"EQUIVALENCE"} disabled={equivalence.status !== EQUIVALENCE_STATUS.VALIDATED} />
          <p className="text-lg leading-tight font-bold line-clamp-2 text-gray-800">{equivalence.type === "Autre" ? equivalence.desc : equivalence.type}</p>
        </div>
      </div>
    </Link>
  );
}
