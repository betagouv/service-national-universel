import React, { useEffect, useState } from "react";
import { Box, BoxHeader } from "../components/commons";
import Iceberg from "../../../assets/icons/Iceberg";
import GroupSelector from "./GroupSelector";
import GroupEditor from "./GroupEditor";
import ButtonPrimary from "../../../components/ui/buttons/ButtonPrimary";
import { getCohortByName } from "../../../services/cohort.service";
import { ROLES } from "snu-lib";

export default function SchemaEditor({ className = "", onExportDetail, department, region, cohort: cohortName, groups, summary, onChange, user }) {
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isUserAuthorizedToExportData, setIsUserAuthorizedToExportData] = useState(false);

  function groupSelected(group) {
    setSelectedGroup(group);
  }

  function onChangeGroup(group, forceReload) {
    setSelectedGroup(group);
    if (group || forceReload) {
      onChange && onChange();
    }
  }

  const checkIfUserIsAuthorizedToExportData = async () => {
    const cohort = await getCohortByName(cohortName);
    if ((!cohort || !cohort.repartitionSchemaDownloadAvailability) && user.role === ROLES.TRANSPORTER) {
      setIsUserAuthorizedToExportData(false);
      return;
    }
    setIsUserAuthorizedToExportData(true);
  };

  useEffect(() => {
    checkIfUserIsAuthorizedToExportData();
  }, []);

  return (
    <Box className={className}>
      <BoxHeader title={"Gérer les volontaires de " + department}>
        <ButtonPrimary onClick={onExportDetail} disabled={!isUserAuthorizedToExportData}>
          Exporter
        </ButtonPrimary>
      </BoxHeader>
      <div className="flex mt-[48px]">
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
          />
        </div>
        <div className="flex-[0_0_1px] bg-[#E5E7EB] w-[1px] mx-[40px]" />
        <div className="flex-[1_1_50%]">
          {selectedGroup ? (
            <GroupEditor group={selectedGroup} onChange={onChangeGroup} />
          ) : (
            <div className="flex items-center justify-center min-h-[412px]">
              <Iceberg />
            </div>
          )}
        </div>
      </div>
    </Box>
  );
}
