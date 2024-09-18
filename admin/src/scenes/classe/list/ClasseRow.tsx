import React from "react";
import { useHistory } from "react-router-dom";
import { HiUsers } from "react-icons/hi";

import { ClasseType, translateStatusClasse } from "snu-lib";
import { Badge } from "@snu/ds/admin";

import { statusClassForBadge } from "../utils";

interface ClasseProps extends ClasseType {
  referentClasse: { firstName: string; lastName: string }[];
}

export default function ClasseRow(classe: ClasseProps) {
  const history = useHistory();
  return (
    <tr className="flex items-center py-3 px-4 hover:bg-gray-50" onClick={() => history.push(`/classes/${classe._id}`)}>
      <td className="flex w-[40%] cursor-pointer items-center gap-4">
        <div className="flex w-full flex-col justify-center">
          <div className="m-0 table w-full table-fixed border-collapse">
            {classe?.name ? (
              <div className="table-cell truncate font-bold text-gray-900 text-base leading-5">{classe.name}</div>
            ) : (
              <div className="table-cell  text-gray-400 italic leading-5">Nom à préciser</div>
            )}
          </div>
          <div className="m-0 mt-1 table w-full table-fixed border-collapse">
            <div className="table-cell truncate text-xs leading-5 text-gray-500 ">id: {classe.uniqueKeyAndId}</div>
          </div>
          {classe?.referentClasse && (
            <div className="m-0 mt-1 table w-full table-fixed border-collapse">
              <div className="table-cell truncate text-xs leading-5 text-gray-900 ">
                {classe.referentClasse[0]?.firstName} {classe.referentClasse[0]?.lastName}
              </div>
            </div>
          )}
        </div>
      </td>
      <td className="flex w-[20%] flex-col gap-2">
        <Badge title={classe?.cohort || "Non renseigné"} className={`${!classe?.cohort && "!text-gray-400 italic"}`} leftIcon={<HiUsers color="#EC4899" size={20} />} />
      </td>
      <td className="flex w-[20%] flex-col gap-2">
        {classe?.totalSeats ? (
          <Badge
            title={
              <div>
                <span className="text-gray-700">{classe.seatsTaken}</span>
                <span className="text-gray-600"> / </span>
                <span className="text-gray-500">{classe.totalSeats}</span>
              </div>
            }
          />
        ) : (
          <Badge title="À préciser" />
        )}
      </td>
      <td className="w-[20%]">
        <Badge title={translateStatusClasse(classe?.status)} status={statusClassForBadge(classe?.status)} />
      </td>
    </tr>
  );
}
