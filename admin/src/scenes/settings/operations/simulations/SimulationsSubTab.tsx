import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HiPlay } from "react-icons/hi";
import { useLocation } from "react-router-dom";

import { CohortDto, formatDateFR, getZonedDate, Phase1Routes, TaskName, translateSimulationName, translateTaskStatus } from "snu-lib";
import { DataTable } from "@snu/ds/admin";

import { Phase1Service } from "@/services/phase1Service";

import ActionCell from "../components/ActionCell";
import StatusCell from "../components/StatusCell";
import RapportCell from "../components/RapportCell";
import SimulationHtsResultCell from "./affectationHts/SimulationHtsResultCell";
import SimulationHtsResultStartButton from "./affectationHts/SimulationHtsResultStartButton";
import SimulationCleResultCell from "./affectationCle/SimulationCleResultCell";
import SimulationCleResultStartButton from "./affectationCle/SimulationCleResultStartButton";
import BasculeJeuneValidesStartButton from "./basculeJeune/BasculeJeuneValidesStartButton";
import BasculeJeuneNonValidesStartButton from "./basculeJeune/BasculeJeuneNonValidesStartButton";
import BasculeJeuneCell from "./basculeJeune/BasculeJeuneCell";
import SimulationCleDromComResultStartButton from "./affectationCle/SimulationCleDromComResultStartButton";

interface SimulationsSubTabProps {
  session: CohortDto;
}

export default function SimulationsSubTab({ session }: SimulationsSubTabProps) {
  const { search } = useLocation();
  const currentAction = new URLSearchParams(search).get("action") || "";
  const currentId = new URLSearchParams(search).get("id") || "";

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
    data: simulations,
  } = useQuery<Phase1Routes["GetSimulationsRoute"]["response"]>({
    queryKey: ["phase-simulations", filters.action, sort],
    queryFn: async () => Phase1Service.getSimulations(session._id!, { name: filters.action, sort }),
  });

  const simulationRows = useMemo(() => {
    return (
      simulations
        ?.filter((simu) => !currentId || simu.id === currentId)
        ?.map((simu) => ({
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
  }, [simulations, currentId]);

  return (
    <div className="flex flex-col gap-8">
      <DataTable<{ id: string; data: Phase1Routes["GetSimulationsRoute"]["response"][0] }>
        isLoading={isLoading}
        isError={!!error}
        rows={simulationRows}
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
            renderCell: (simulation) => <ActionCell simulation={simulation} session={session} />,
          },
          {
            key: "metadata",
            title: "Resultats",
            renderCell: (simulation) => {
              switch (simulation.name) {
                case TaskName.AFFECTATION_HTS_SIMULATION:
                  return <SimulationHtsResultCell simulation={simulation} />;
                case TaskName.AFFECTATION_CLE_SIMULATION:
                case TaskName.AFFECTATION_CLE_DROMCOM_SIMULATION:
                  return <SimulationCleResultCell simulation={simulation} />;
                case TaskName.BACULE_JEUNES_VALIDES_SIMULATION:
                case TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION:
                  return <BasculeJeuneCell simulation={simulation} />;
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
            title: "Simulat.",
            renderCell: RapportCell,
          },
          {
            key: "lancer",
            title: "Lancer",
            renderCell: (simulation) => {
              if (simulation.name === TaskName.AFFECTATION_HTS_SIMULATION) {
                return <SimulationHtsResultStartButton simulation={simulation} />;
              } else if (simulation.name === TaskName.AFFECTATION_CLE_SIMULATION) {
                return <SimulationCleResultStartButton simulation={simulation} />;
              } else if (simulation.name === TaskName.AFFECTATION_CLE_DROMCOM_SIMULATION) {
                return <SimulationCleDromComResultStartButton simulation={simulation} />;
              } else if (simulation.name === TaskName.BACULE_JEUNES_VALIDES_SIMULATION) {
                return <BasculeJeuneValidesStartButton simulation={simulation} />;
              } else if (simulation.name === TaskName.BACULE_JEUNES_NONVALIDES_SIMULATION) {
                return <BasculeJeuneNonValidesStartButton simulation={simulation} />;
              }
              return <HiPlay className="text-gray-400" size={50} />;
            },
          },
        ]}
      />
    </div>
  );
}
