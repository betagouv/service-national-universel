import React, { useEffect, useState } from "react";
import { Box, BoxHeader } from "../components/commons";
import Iceberg from "../../../assets/icons/Iceberg";
import GroupSelector from "./GroupSelector";
import GroupEditor from "./GroupEditor";
import { getCohortByName } from "@/services/cohort.service";
import { ROLES } from "snu-lib";
import ReactTooltip from "react-tooltip";
import { Button } from "@snu/ds/admin";
import { capture } from "@/sentry";
import { toastr } from "react-redux-toastr";

export default function SchemaEditor({ className = "", onExportDetail, department, region, cohortName, groups, summary, onChange, user }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isUserAuthorizedToExportData, setIsUserAuthorizedToExportData] = useState(false);
  const [isUserAuthorizedToCreateGroup, setIsUserAuthorizedToCreateGroup] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  function groupSelected(group) {
    setSelectedGroup(group);
  }

  function onChangeGroup(group, forceReload) {
    setSelectedGroup(group);
    if (group || forceReload) {
      onChange && onChange();
    }
  }

  const handleClickedExport = async () => {
    try {
      setExportLoading(true);
      await onExportDetail();
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue lors de la récupération des données. Nous ne pouvons exporter les données.");
    } finally {
      setExportLoading(false);
    }
  };

  const checkIfUserIsAuthorizedToExportData = async (cohort) => {
    if ((!cohort || !cohort.repartitionSchemaDownloadAvailability) && user.role === ROLES.TRANSPORTER) {
      setIsUserAuthorizedToExportData(false);
      return;
    }
    setIsUserAuthorizedToExportData(true);
  };

  const checkIfUserIsAuthorizedToCreateGroup = async (cohort) => {
    if ([ROLES.TRANSPORTER, ROLES.REFERENT_DEPARTMENT].includes(user.role)) {
      setIsUserAuthorizedToCreateGroup(false);
      return;
    }
    if (user.role === ROLES.REFERENT_REGION && user.region !== region) {
      setIsUserAuthorizedToCreateGroup(false);
      return;
    }
    if (user.role === ROLES.REFERENT_REGION && (!cohort || !cohort.repartitionSchemaCreateAndEditGroupAvailability)) {
      setIsUserAuthorizedToCreateGroup(false);
      return;
    }
    setIsUserAuthorizedToCreateGroup(true);
  };

  const checkUserAuthorizations = async () => {
    const { data: cohort } = await getCohortByName(cohortName);
    checkIfUserIsAuthorizedToExportData(cohort);
    checkIfUserIsAuthorizedToCreateGroup(cohort);
  };

  useEffect(() => {
    checkUserAuthorizations();
  }, [cohortName]);

  return (
    <Box className={className}>
      <BoxHeader title={`Gérer les volontaires de ${department}`}>
        <span data-tip data-tip-disable={false} data-for="export-data">
          <Button onClick={() => handleClickedExport()} title="Exporter" loading={exportLoading} disabled={!isUserAuthorizedToExportData} />
          <ReactTooltip
            disable={isUserAuthorizedToExportData}
            id="export-data"
            type="light"
            place="top"
            effect="solid"
            className="custom-tooltip-radius !opacity-100 !shadow-md"
            tooltipRadius="6">
            <p className=" w-[275px] list-outside !px-2 !py-1.5 text-left text-xs text-gray-600">
              Précision de la ou des zones géographiques ou scolaires concernées par le séjour.
            </p>
          </ReactTooltip>
        </span>
      </BoxHeader>
      <div className="mt-[48px] flex">
        <div className="flex-[1_1_50%] overflow-auto">
          <GroupSelector
            title="Volontaires restants à grouper"
            youngsCount={Math.max(0, summary.total - summary.intradepartmental - summary.assigned + summary.intradepartmentalAssigned)}
            groups={groups.extra}
            department={department}
            region={region}
            cohort={cohortName}
            onSelect={groupSelected}
            selectedGroup={selectedGroup}
            isUserAuthorizedToCreateGroup={isUserAuthorizedToCreateGroup}
          />
          <GroupSelector
            className="mt-[32px]"
            title="Volontaires restants à grouper"
            intradepartmental={true}
            youngsCount={Math.max(0, summary.intradepartmental - summary.intradepartmentalAssigned)}
            groups={groups.intra}
            department={department}
            region={region}
            cohort={cohortName}
            onSelect={groupSelected}
            selectedGroup={selectedGroup}
            isUserAuthorizedToCreateGroup={isUserAuthorizedToCreateGroup}
          />
        </div>
        <div className="mx-[40px] w-[1px] flex-[0_0_1px] bg-[#E5E7EB]" />
        <div className="flex-[1_1_50%]">
          {selectedGroup ? (
            <GroupEditor group={selectedGroup} onChange={onChangeGroup} isUserAuthorizedToCreateGroup={isUserAuthorizedToCreateGroup} />
          ) : (
            <div className="flex min-h-[412px] items-center justify-center">
              <Iceberg />
            </div>
          )}
        </div>
      </div>
    </Box>
  );
}
