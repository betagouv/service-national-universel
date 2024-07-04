import React from "react";
import { Link } from "react-router-dom";
import IconDomain from "@/scenes/missions/components/IconDomain";
import { EQUIVALENCE_STATUS, translateEquivalenceStatus } from "snu-lib";
import { applicationBadgeStyle } from "@/utils";

export default function EquivalenceCard({ equivalence }) {
  return (
    <div className="bg-white rounded-xl border  w-72 md:w-96 flex-none snap-always snap-center first:ml-4 last:mr-4">
      <p className="h-8 p-2 text-xs bg-gray-50 border-b-[1px] rounded-t-xl">✏️ Vous avez ajouté cet engagement</p>

      <div className="h-36 px-3 py-2.5 flex flex-col justify-between">
        <p className={`text-xs rounded-full px-2 py-1 w-fit ${applicationBadgeStyle[equivalence.status]}`}>{translateEquivalenceStatus(equivalence.status)}</p>

        <p className="text-xs leading-5 text-gray-400">{equivalence.structureName}</p>

        <Link to={`/equivalence/${equivalence.id}`} className="flex items-center gap-4">
          <IconDomain domain={"EQUIVALENCE"} disabled={equivalence.status !== EQUIVALENCE_STATUS.VALIDATED} />
          <p className="text-lg leading-tight font-bold line-clamp-2">{equivalence.type}</p>
        </Link>
      </div>
    </div>
  );
}
