import React from "react";
import { User } from "@/types";
import { DropdownButton } from "@snu/ds/admin";
import { ROLES, canExportConvoyeur } from "snu-lib";
import { ExportComponent } from "@/components/filters-system-v2";
import { exportLigneBus, exportConvoyeur, transformPlanDeTransportForExport } from "../../util";

interface Props {
  cohort: string;
  selectedFilters: any;
  user: User;
}

export default function HeaderExport({ cohort, selectedFilters, user }: Props) {
  const selectTest = [
    {
      key: "1",
      items: [
        {
          action: async () => {},
          render: (
            // @ts-ignore
            <ExportComponent
              title="Plan de transport"
              exportTitle="Plan_de_transport"
              route="/elasticsearch/plandetransport/export"
              selectedFilters={selectedFilters}
              setIsOpen={() => true}
              customCss={{
                override: true,
                button: `flex items-center gap-2 p-2 px-3 text-gray-700 cursor-pointer w-full text-sm text-gray-700`,
                loadingButton: `text-sm text-gray-700`,
              }}
              transform={transformPlanDeTransportForExport}
            />
          ),
        },
        [ROLES.ADMIN, ROLES.TRANSPORTER, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role)
          ? {
              action: async () => {
                await exportLigneBus(cohort);
              },
              render: (
                <div className="flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 ">
                  <div className="text-sm text-gray-700">Volontaires par ligne</div>
                </div>
              ),
            }
          : null,
        canExportConvoyeur(user)
          ? {
              action: async () => {
                await exportConvoyeur(cohort);
              },
              render: (
                <div className="flex cursor-pointer items-center gap-2 p-2 px-3 text-gray-700 ">
                  <div className="text-sm text-gray-700">Convoyeurs</div>
                </div>
              ),
            }
          : null,
      ].filter((x) => x),
    },
  ];
  // @ts-ignore
  return <DropdownButton title={"Exporter"} optionsGroup={selectTest} position={"right"} />;
}
