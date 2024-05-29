import React from "react";
import { Link } from "react-router-dom";
import { Container, Button } from "@snu/ds/admin";
import { ROLES, YOUNG_STATUS } from "snu-lib";
import { Classe, User } from "@/types";

interface Props {
  classe: Classe;
  user: User;
  studentStatus: { [key: string]: number };
  totalSeatsTakenExcluding: number;
}

export default function StatsInfos({ classe, user, studentStatus, totalSeatsTakenExcluding }: Props) {
  return (
    <Container
      title="Suivi de la classe"
      actions={[
        <Link key="list-students" to={`${[ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role) ? "/mes-eleves" : "/inscription"}?classeId=${classe._id}`}>
          <Button type="tertiary" title="Voir les élèves" />
        </Link>,
      ]}>
      <div className="flex justify-between">
        <table className="flex-1">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="font-bold pr-4 py-2">Objectif :</td>
              <td className="px-4 font-bold text-lg text-center py-2">{classe.totalSeats || 0}</td>
              <td className="text-gray-500 text-center py-2">Élèves</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="font-bold pr-4 py-2">Total :</td>
              <td className="px-4 font-bold text-lg text-center py-2">{totalSeatsTakenExcluding}</td>
              <td className="text-gray-500 text-center py-2">({Math.round((totalSeatsTakenExcluding * 100) / classe.totalSeats || 0)}%)</td>
            </tr>
            <tr>
              <td className="font-bold pr-4 py-2">Places libres :</td>
              <td className="px-4 font-bold text-lg text-center py-2">{classe.totalSeats - classe.seatsTaken < 0 ? 0 : classe.totalSeats - classe.seatsTaken}</td>
              <td className="text-gray-500 text-center py-2">
                ({Math.round(100 - (classe.seatsTaken * 100) / classe.totalSeats) < 0 ? 0 : Math.round(100 - (classe.seatsTaken * 100) / classe.totalSeats)}%)
              </td>
            </tr>
          </tbody>
        </table>
        <div className="mx-8 w-[1px] bg-gray-200">&nbsp;</div>
        <table className="flex-1">
          <tbody>
            <tr>
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.VALIDATED] || 0}</td>
              <td className="px-4 flex-1">Élèves validés</td>
              <td className="text-gray-500">({Math.round((studentStatus[YOUNG_STATUS.VALIDATED] * 100) / studentStatus.total || 0)}%)</td>
            </tr>
            <tr>
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.IN_PROGRESS] || 0}</td>
              <td className="px-4 flex-1">Élèves en cours d'inscription</td>
              <td className="text-gray-500">({Math.round((studentStatus[YOUNG_STATUS.IN_PROGRESS] * 100) / studentStatus.total || 0)}%)</td>
            </tr>
            <tr>
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.WAITING_VALIDATION] || 0}</td>
              <td className="px-4 flex-1">Élèves en attente de validation</td>
              <td className="text-gray-500">({Math.round((studentStatus[YOUNG_STATUS.WAITING_VALIDATION] * 100) / studentStatus.total || 0)}%)</td>
            </tr>
            <tr>
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.WAITING_CORRECTION] || 0}</td>
              <td className="px-4 flex-1">Élèves en attente de correction</td>
              <td className="text-gray-500">({Math.round((studentStatus[YOUNG_STATUS.WAITING_CORRECTION] * 100) / studentStatus.total || 0)}%)</td>
            </tr>
          </tbody>
        </table>
        <div className="mx-8 w-[1px] bg-gray-200">&nbsp;</div>
        <table className="flex-1">
          <tbody>
            <tr>
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.ABANDONED] || 0}</td>
              <td className="px-4 flex-1">Inscriptions abandonnées</td>
              <td className="text-gray-500">({Math.round((studentStatus[YOUNG_STATUS.ABANDONED] * 100) / studentStatus.total || 0)}%)</td>
            </tr>
            <tr className="">
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.NOT_AUTORISED] || 0}</td>
              <td className="px-4 flex-1">Élèves non autorisés</td>
              <td className="text-gray-500">({Math.round((studentStatus[YOUNG_STATUS.NOT_AUTORISED] * 100) / studentStatus.total || 0)}%)</td>
            </tr>
            <tr>
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.WITHDRAWN] || 0}</td>
              <td className="px-4 flex-1">Élèves désistés</td>
              <td className="text-gray-500">({Math.round((studentStatus[YOUNG_STATUS.WITHDRAWN] * 100) / studentStatus.total || 0)}%)</td>
            </tr>
            <tr>
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.REFUSED] || 0}</td>
              <td className="px-4 flex-1">Élèves refusés</td>
              <td className="text-gray-500">({Math.round((studentStatus[YOUNG_STATUS.REFUSED] * 100) / studentStatus.total || 0)}%)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Container>
  );
}
