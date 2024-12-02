import React from "react";
import { Link } from "react-router-dom";
import ReactTooltip from "react-tooltip";
import { HiOutlineInformationCircle } from "react-icons/hi";

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
  const isUserCLE = [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role);
  const isUserAdminOrReferent = [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role);
  const openFiles =
    (studentStatus[YOUNG_STATUS.VALIDATED] || 0) +
    (studentStatus[YOUNG_STATUS.IN_PROGRESS] || 0) +
    (studentStatus[YOUNG_STATUS.WAITING_VALIDATION] || 0) +
    (studentStatus[YOUNG_STATUS.WAITING_CORRECTION] || 0);

  const linkPath = isUserCLE ? "/mes-eleves" : "/inscription";
  const showButton = (isUserCLE && classe.schoolYear === "2024-2025") || isUserAdminOrReferent;
  return (
    <Container
      title="Suivi de la classe"
      actions={[
        showButton && (
          <Link key="list-students" to={`${linkPath}?classeId=${classe._id}`}>
            <Button type="tertiary" title="Voir la liste des élèves" className="w-full max-w-none mt-3" />
          </Link>
        ),
      ]}>
      <div className="flex justify-between">
        <table className="flex-1">
          <tbody>
            <tr className="border-b border-gray-200 cursor-default">
              <td className="font-bold pr-4 py-2">Élèves prévus :</td>
              <td className="px-4 font-bold text-lg text-center py-2">{classe.totalSeats || 0}</td>
              <td className="text-gray-500 text-center py-2">Élèves</td>
            </tr>
            <tr className="border-b border-gray-200 cursor-default">
              <td className="font-bold pr-4 py-2 flex">
                <p>Dossiers ouverts : </p>
                <HiOutlineInformationCircle data-tip data-for="tooltip-openfile" className="mb-1 ml-2 text-gray-400 cursor-pointer" size={20} />
                <ReactTooltip id="tooltip-openfile" type="light" place="top" effect="solid" className="custom-tooltip-radius rounded-md !opacity-100 !shadow-md !z-50">
                  <div className="text-gray-700 text-xs font-[400] w-[260px] text-center mb-1">
                    =élèves validés + inscription en cours + en attente de validation + en attente de correction
                  </div>
                </ReactTooltip>
              </td>
              <td className="px-4 font-bold text-lg text-center py-2">{openFiles}</td>
              <td className="text-gray-500 text-center py-2">Dossiers</td>
            </tr>
            <tr className="border-b border-gray-200 cursor-default">
              <td className="font-bold pr-4 py-2">Élèves inscrits :</td>
              <td className="px-4 font-bold text-lg text-center py-2">{validatedYoung}</td>
              <td className="text-gray-500 text-center py-2">({Math.round((validatedYoung * 100) / classe.totalSeats || 0)}%)</td>
            </tr>
            <tr className="cursor-default">
              <td className="font-bold pr-4 py-2">Places libres :</td>
              <td className="px-4 font-bold text-lg text-center py-2">{classe.totalSeats - validatedYoung < 0 ? 0 : classe.totalSeats - validatedYoung}</td>
              <td className="text-gray-500 text-center py-2"> ({Math.round(100 - (validatedYoung * 100) / classe.totalSeats)}%)</td>
            </tr>
          </tbody>
        </table>
        <div className="mx-8 w-[1px] bg-gray-200">&nbsp;</div>
        <table className="flex-1">
          <tbody>
            <tr className="cursor-default">
              <td className="font-bold text-lg text-right">{studentStatus.affectedStudents || 0}</td>
              <td className="px-4 flex-1">Élèves affectés</td>
            </tr>
            <tr className="cursor-default">
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.VALIDATED] || 0}</td>
              <td className="px-4 flex-1">Élèves validés</td>
            </tr>
            <tr className="cursor-default">
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.IN_PROGRESS] || 0}</td>
              <td className="px-4 flex-1">Élèves en cours d'inscription</td>
            </tr>
            <tr className="cursor-default">
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.WAITING_VALIDATION] || 0}</td>
              <td className="px-4 flex-1">Élèves en attente de validation</td>
            </tr>
            <tr className="cursor-default">
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.WAITING_CORRECTION] || 0}</td>
              <td className="px-4 flex-1">Élèves en attente de correction</td>
            </tr>
          </tbody>
        </table>
        <div className="mx-8 w-[1px] bg-gray-200">&nbsp;</div>
        <table className="flex-1">
          <tbody>
            <tr className="cursor-default">
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.ABANDONED] || 0}</td>
              <td className="px-4 flex-1">Inscriptions abandonnées</td>
            </tr>
            <tr className="cursor-default">
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.NOT_AUTORISED] || 0}</td>
              <td className="px-4 flex-1">Élèves non autorisés</td>
            </tr>
            <tr className="cursor-default">
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.WITHDRAWN] || 0}</td>
              <td className="px-4 flex-1">Élèves désistés</td>
            </tr>
            <tr className="cursor-default">
              <td className="font-bold text-lg text-right">{studentStatus[YOUNG_STATUS.REFUSED] || 0}</td>
              <td className="px-4 flex-1">Élèves refusés</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Container>
  );
}
