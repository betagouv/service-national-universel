import React from "react";
import { User } from "@/types";
import { DropdownButton } from "@snu/ds/admin";
import { ROLES, PlanTransportType, getDepartmentNumber, canExportConvoyeur } from "snu-lib";
import { ExportComponent } from "@/components/filters-system-v2";
import { exportLigneBus, exportConvoyeur } from "../../util";

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
              transform={async (all: PlanTransportType[]) => {
                // Get the length of the longest array of PDRs
                const maxPDRs = all.reduce((max, item) => (item.pointDeRassemblements.length > max ? item.pointDeRassemblements.length : max), 0);

                return all.map((data) => {
                  const pdrs = {};

                  for (let i = 0; i < maxPDRs; i++) {
                    const pdr = data.pointDeRassemblements?.[i];
                    const num = i + 1;
                    pdrs[`N° DE DEPARTEMENT PDR ${num}`] = pdr?.department ? getDepartmentNumber(pdr.department) : "";
                    pdrs[`REGION DU PDR ${num}`] = pdr?.region || "";
                    pdrs[`ID PDR ${num}`] = pdr?.meetingPointId || "";
                    pdrs[`MATRICULE DU PDR ${num}`] = pdr?.matricule || "";
                    pdrs[`TYPE DE TRANSPORT PDR ${num}`] = pdr?.transportType || "";
                    pdrs[`NOM + ADRESSE DU PDR ${num}`] = pdr?.name ? pdr.name + " / " + pdr.address : "";
                    pdrs[`HEURE ALLER ARRIVÉE AU PDR ${num}`] = pdr?.busArrivalHour || "";
                    pdrs[`HEURE DE CONVOCATION AU PDR ${num}`] = pdr?.meetingHour || "";
                    pdrs[`HEURE DEPART DU PDR ${num}`] = pdr?.departureHour || "";
                    pdrs[`HEURE DE RETOUR ARRIVÉE AU PDR ${num}`] = pdr?.returnHour || "";
                  }

                  return {
                    "NUMERO DE LIGNE": data.busId,
                    "DATE DE TRANSPORT ALLER": data.departureString,
                    "DATE DE TRANSPORT RETOUR": data.returnString,
                    ...pdrs,
                    "N° DU DEPARTEMENT DU CENTRE": getDepartmentNumber(data.centerDepartment),
                    "REGION DU CENTRE": data.centerRegion,
                    "ID CENTRE": data.centerId,
                    "MATRICULE DU CENTRE": data.centerCode,
                    "NOM + ADRESSE DU CENTRE": data.centerName + " / " + data.centerAddress,
                    "HEURE D'ARRIVEE AU CENTRE": data.centerArrivalTime,
                    "HEURE DE DÉPART DU CENTRE": data.centerDepartureTime,

                    // * followerCapacity !== Total des followers mais c'est la sémantique ici
                    "TOTAL ACCOMPAGNATEURS": data.followerCapacity,

                    "CAPACITÉ VOLONTAIRE TOTALE": data.youngCapacity,
                    "CAPACITE TOTALE LIGNE": data.totalCapacity,
                    "PAUSE DÉJEUNER ALLER": data.lunchBreak ? "Oui" : "Non",
                    "PAUSE DÉJEUNER RETOUR": data.lunchBreakReturn ? "Oui" : "Non",
                    "TEMPS DE ROUTE": data.travelTime.includes(":") ? data.travelTime : `${data.travelTime}:00`,
                    "RETARD ALLER": data.delayedForth === "true" ? "Oui" : "Non",
                    "RETARD RETOUR": data.delayedBack === "true" ? "Oui" : "Non",
                    "LIGNES FUSIONNÉES": data.mergedBusIds?.join(",") || "",
                    "LIGNE MIROIR": data.mirrorBusId || "",
                  };
                });
              }}
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
