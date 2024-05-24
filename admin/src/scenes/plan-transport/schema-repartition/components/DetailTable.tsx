import React, { useState, useEffect } from "react";
import ReactTooltip from "react-tooltip";
import { Link } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import ExternalLink from "@/assets/icons/ExternalLink";

import { ROLES, getDepartmentNumber, COHORT_TYPE } from "snu-lib";
import { CohortDto } from "snu-lib/src/dto/cohortDto";
import { Button } from "@snu/ds/admin";
import { capture } from "@/sentry";
import { User } from "@/types";

import { Box, BoxHeader, Badge, Loading, AlertPoint } from "../../components/commons";
import { formatRate } from "../../util";

interface Props {
  rows: Array<{
    assigned: number;
    capacity: number;
    intradepartmentalAssigned: number;
    intradepartmental: number;
    name: string;
    total: number;
    intraCapacity?: number;
  }>;
  className?: string;
  loading: boolean;
  isNational: boolean;
  onGoToRow: (row) => void;
  onExportDetail: () => void;
  user: User;
  cohort: CohortDto;
}

export default function DetailTable({ rows, className, loading, isNational, onGoToRow, onExportDetail, cohort, user }: Props) {
  const [isUserAuthorizedToExportData, setIsUserAuthorizedToExportData] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  function goToRow(row) {
    onGoToRow && onGoToRow(row);
  }

  const checkIfUserIsAuthorizedToExportData = async () => {
    if ((!cohort || !cohort.repartitionSchemaDownloadAvailability) && user.role === ROLES.TRANSPORTER) {
      setIsUserAuthorizedToExportData(false);
      return;
    }
    setIsUserAuthorizedToExportData(true);
  };

  useEffect(() => {
    checkIfUserIsAuthorizedToExportData();
  }, [cohort]);

  const handleClickedExport = async () => {
    try {
      setExportLoading(true);
      await onExportDetail();
    } catch (e) {
      capture(e);
      toastr.error("Erreur", "Oups, une erreur est survenue lors de la récupération des données. Nous ne pouvons exporter les données.");
    } finally {
      setExportLoading(false);
    }
  };

  //console.log("const", isUserAuthorizedToExportData);
  //console.log("condition", (!cohort || !cohort.repartitionSchemaDownloadAvailability) && user.role === ROLES.TRANSPORTER);

  return (
    <Box className={className}>
      <BoxHeader title="Schéma de répartition">
        <span data-tip data-tip-disable={false} data-for="export-data">
          <Button title="Exporter" onClick={() => handleClickedExport()} loading={exportLoading} disabled={!isUserAuthorizedToExportData} />
          <ReactTooltip disable={isUserAuthorizedToExportData} id="export-data" type="light" place="top" effect="solid" className="custom-tooltip-radius !opacity-100 !shadow-md">
            <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
              L&apos;export n&apos;est pas disponible au téléchargement. Contactez-nous pour plus d&apos;information
            </p>
          </ReactTooltip>
        </span>
      </BoxHeader>
      {cohort?.type === COHORT_TYPE.VOLONTAIRE && (
        <div className="border-t-[1px] border-t-[##E5E7EB] mt-[24px]">
          <table className="w-[100%]">
            <thead className="text-[11px] uppercase leading-[16px] text-[#7E858C]">
              <tr className="border-b-[1px] border-b-[#F4F5FA]">
                <th className="py-[17px] pr-[16px] font-medium">{isNational ? "Régions" : "Départements"}</th>
                <th className="py-[17px] pr-[16px] font-medium">Volontaires</th>
                <th className="py-[17px] pr-[16px] font-medium">Places restantes</th>
                <th className="py-[17px] pr-[16px] font-medium">Volontaires en intra-départemental</th>
                <th className="py-[17px] font-medium">Places restantes dans le département</th>
              </tr>
            </thead>
            <tbody className="text-[14px] font-medium leading-[16px] text-[#1F2937]">
              {rows.map((row) => (
                <tr key={row.name} className="border-b-[1px] border-b-[#F4F5FA] hover:bg-[#F2F5FC]" onClick={() => goToRow(row)}>
                  <td className="whitespace-nowrap py-[17px] px-[9px] text-[15px] font-bold text-[#242526]">
                    {row.name} {!isNational ? `(${getDepartmentNumber(row.name)})` : null}
                  </td>
                  <td className="py-[17px] px-[8px]">
                    {loading ? (
                      <Loading width={"w-full"} />
                    ) : (
                      <div className="flex items-center">
                        <div className="mr-[8px]">{row.total}</div>
                        <Badge className="">{formatRate(row.assigned, row.total)} affectés</Badge>
                      </div>
                    )}
                  </td>
                  <td className="py-[17px] px-[8px]">
                    {loading ? (
                      <Loading width={"w-full"} />
                    ) : (
                      <div className="flex items-center">
                        <AlertPoint threshold={50} value={row.capacity - row.assigned} />
                        <span>{Math.max(0, row.capacity - row.assigned)}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-[17px] px-[8px]">
                    {loading ? (
                      <Loading width={"w-full"} />
                    ) : (
                      <div className="flex items-center">
                        <div className="">{row.intradepartmental}</div>
                        {row.intradepartmental > 0 && (
                          <Badge mode={row.intradepartmentalAssigned === row.intradepartmental ? "green" : "blue"} className="ml-2">
                            {formatRate(row.intradepartmentalAssigned, row.intradepartmental)} affectés
                          </Badge>
                        )}
                        {user.role !== ROLES.TRANSPORTER && (
                          <Link
                            to={getIntradepartmentalYoungsLink(isNational ? row.name : null, isNational ? null : row.name, cohort.name)}
                            className="ml-2"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}>
                            <ExternalLink className="text-[#9CA3AF]" />
                          </Link>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="py-[17px] px-[8px]">
                    {loading ? (
                      <Loading width={"w-full"} />
                    ) : (
                      <div className="flex items-center">
                        <AlertPoint threshold={0} value={row.intraCapacity || 0 - row.intradepartmentalAssigned} />
                        {Math.max(0, row.intraCapacity || 0 - row.intradepartmentalAssigned)}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Box>
  );
}

function getIntradepartmentalYoungsLink(region, department, cohort) {
  let url =
    "/volontaire?STATUS=" + encodeURIComponent('["VALIDATED"]') + "&COHORT=" + encodeURIComponent('["' + cohort + '"]') + "&SAME_DEPARTMENT=" + encodeURIComponent('["true"]');

  if (department) {
    url += "&DEPARTMENT=" + encodeURIComponent('["' + department + '"]');
  } else if (region) {
    url += "&REGION=" + encodeURIComponent('["' + region + '"]');
  }

  return url;
}
