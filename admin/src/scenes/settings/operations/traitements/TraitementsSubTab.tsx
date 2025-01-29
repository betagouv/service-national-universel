import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";

import { CohortDto, formatDateFR, getZonedDate, Phase1Routes, TaskName, translateSimulationName, translateTaskStatus } from "snu-lib";
import { DataTable } from "@snu/ds/admin";

import { Phase1Service } from "@/services/phase1Service";
import ActionCell from "../components/ActionCell";
import StatusCell from "../components/StatusCell";
import RapportCell from "../components/RapportCell";
import AffectationHtsResultCell from "./affectationHts/AffectationHtsResultCell";
import { tr } from "date-fns/locale";
import BasculeJeuneValidesResultCell from "./basculeJeuneValides/BasculeJeuneValidesResultCell";

interface TraitementsSubTabProps {
  session: CohortDto;
}

export default function TraitementsSubTab({ session }: TraitementsSubTabProps) {
  const { search } = useLocation();
  const currentAction = new URLSearchParams(search).get("action") || "";

  const [sort, setSort] = useState<"ASC" | "DESC">("DESC");
  const [filters, setFilters] = useState({
    action: currentAction,
    createdAt: "",
    author: "",
    statut: "",
  });

  const {
    isFetching: isLoading,
    error,
    data: traitements,
  } = useQuery<Phase1Routes["GetTraitementsRoute"]["response"]>({
    queryKey: ["phase-traitements", filters.action, sort],
    queryFn: async () => Phase1Service.getTraitements(session._id!, { name: filters.action, sort }),
  });

  const traitementRows = useMemo(() => {
    return (
      traitements?.map((simu) => ({
        id: simu.id,
        data: {
          ...simu,
          statut: translateTaskStatus(simu.status),
          action: translateSimulationName(simu.name),
          date: formatDateFR(getZonedDate(simu.createdAt)),
          author: `${simu.metadata?.parameters?.auteur?.prenom || ""} ${simu.metadata?.parameters?.auteur?.nom || ""}`,
        },
      })) || []
    );
  }, [traitements]);

  return (
    <div className="flex flex-col gap-8">
      <DataTable<{ id: string; data: Phase1Routes["GetTraitementsRoute"]["response"][0] }>
        isLoading={isLoading}
        isError={!!error}
        rows={traitementRows}
        isSortable
        sort={sort}
        onSortChange={setSort}
        filters={filters}
        onFiltersChange={(filtersUpdated) => setFilters(filtersUpdated as any)}
        columns={[
          {
            key: "name",
            title: "Action",
            filtrable: true,
            filterKeys: [
              { key: "action", label: "Action", externalKey: "name", external: true },
              { key: "date", label: "Date" },
              { key: "author", label: "Auteur" },
            ],
            renderCell: (traitement) => <ActionCell simulation={traitement} session={session} />,
          },
          {
            key: "metadata",
            title: "Resultats",
            renderCell: (traitement) => {
              switch (traitement.name) {
                case TaskName.AFFECTATION_HTS_SIMULATION_VALIDER:
                case TaskName.AFFECTATION_CLE_SIMULATION_VALIDER:
                  return <AffectationHtsResultCell simulation={traitement} />;
                case TaskName.BACULE_JEUNES_VALIDES_SIMULATION_VALIDER:
                  return <BasculeJeuneValidesResultCell simulation={traitement} />;
              }
              return null;
            },
          },
          {
            key: "statut",
            title: "Statut",
            filtrable: true,
            renderCell: StatusCell,
          },
          {
            key: "rapportKey",
            title: "Rapport",
            renderCell: RapportCell,
          },
        ]}
      />
    </div>
  );
}
