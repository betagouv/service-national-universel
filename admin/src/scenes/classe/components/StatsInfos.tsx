import React from "react";
import { Link } from "react-router-dom";
import { Container, Button } from "@snu/ds/admin";
import { ROLES, YOUNG_STATUS, ClassesRoutes } from "snu-lib";
import { User } from "@/types";

interface Props {
  classe: NonNullable<ClassesRoutes["GetOne"]["response"]["data"]>;
  user: User;
  studentStatus: { [key: string]: number };
  validatedYoung: number;
}

export default function StatsInfos({ classe, user, studentStatus, validatedYoung }: Props) {
  return (
    <Container
      title="Suivi de la classe"
      actions={[
        <Link key="list-students" to={`${[ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role) ? "/mes-eleves" : "/inscription"}?classeId=${classe._id}`}>
          <Button type="tertiary" title="Voir la liste des élèves" />
        </Link>,
      ]}>
      <div className="flex justify-between">
        <table className="flex-1">
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="font-bold pr-4 py-2">Effectif ajusté :</td>
              <td className="px-4 font-bold text-lg text-center py-2">{classe.totalSeats || 0}</td>
              <td className="text-gray-500 text-center py-2">Élèves</td>
            </tr>
            <tr className="border-b border-gray-200">
              <td className="font-bold pr-4 py-2">Effectif inscrit :</td>
              <td className="px-4 font-bold text-lg text-center py-2">{validatedYoung}</td>
              <td className="text-gray-500 text-center py-2">({Math.round((validatedYoung * 100) / classe.totalSeats || 0)}%)</td>
            </tr>
            <tr>
              <td className="font-bold pr-4 py-2">Places libres :</td>
              <td className="px-4 font-bold text-lg text-center py-2">{classe.totalSeats - validatedYoung < 0 ? 0 : classe.totalSeats - validatedYoung}</td>
              <td className="text-gray-500 text-center py-2"> ({Math.round(100 - (validatedYoung * 100) / classe.totalSeats)}%)</td>
            </tr>
          </tbody>
        </table>
        <div className="mx-8 w-[1px] bg-gray-200">&nbsp;</div>
        <table className="flex-1">
          <tbody>
            <tr>
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.VALIDATED] || 0}</td>
              <td className="px-4 flex-1">Élèves validés</td>
            </tr>
            <tr>
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.IN_PROGRESS] || 0}</td>
              <td className="px-4 flex-1">Élèves en cours d'inscription</td>
            </tr>
            <tr>
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.WAITING_VALIDATION] || 0}</td>
              <td className="px-4 flex-1">Élèves en attente de validation</td>
            </tr>
            <tr>
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.WAITING_CORRECTION] || 0}</td>
              <td className="px-4 flex-1">Élèves en attente de correction</td>
            </tr>
          </tbody>
        </table>
        <div className="mx-8 w-[1px] bg-gray-200">&nbsp;</div>
        <table className="flex-1">
          <tbody>
            <tr>
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.ABANDONED] || 0}</td>
              <td className="px-4 flex-1">Inscriptions abandonnées</td>
            </tr>
            <tr className="">
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.NOT_AUTORISED] || 0}</td>
              <td className="px-4 flex-1">Élèves non autorisés</td>
            </tr>
            <tr>
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.WITHDRAWN] || 0}</td>
              <td className="px-4 flex-1">Élèves désistés</td>
            </tr>
            <tr>
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.REFUSED] || 0}</td>
              <td className="px-4 flex-1">Élèves refusés</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Container>
  );
}
