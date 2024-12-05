import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HiOutlinePaperClip, HiPlay } from "react-icons/hi";
import { useLocation } from "react-router-dom";

import { CohortDto, formatDateFR, getZonedDate, Phase1Routes, TaskName, translate, translateSimulationName, translateTaskStatus } from "snu-lib";
import { Badge, DataTable, TBadgeStatus, Tooltip } from "@snu/ds/admin";

import { downloadSecuredFile } from "@/services/file.service";
import { Phase1Service } from "@/services/phase1Service";
import SimulationsHtsResults from "./simulationHts/SimulationHtsResult";
import ActionCell from "./ActionCell";
import SimulationHtsResultStartButton from "./simulationHts/SimulationHtsResultStartButton";

interface SimulationsSubTabProps {
  session: CohortDto;
}

const MAPPING_STATUS_COLOR: { [key: string]: TBadgeStatus } = {
  PENDING: "none",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "VALIDATED",
  FAILED: "REFUSED",
};

export default function SimulationsSubTab({ session }: SimulationsSubTabProps) {
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
    isPending,
    error,
    data: simulations,
  } = useQuery<Phase1Routes["GetSimulationsRoute"]["response"]>({
    queryKey: ["phase-simulations", filters.action, sort],
    queryFn: async () => Phase1Service.getSimulations(session._id!, { name: filters.action, sort }),
  });

  const simulationRows = useMemo(() => {
    return (
      simulations?.map((simu) => ({
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
  }, [simulations]);

  return (
    <div className="flex flex-col gap-8">
      <DataTable<{ id: string; data: Phase1Routes["GetSimulationsRoute"]["response"][0] }>
        isLoading={isPending}
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
            renderCell: (simulation) => <ActionCell simulation={simulation} />,
          },
          {
            key: "fieldKey",
            title: "Resultats",
            renderCell: (simulation) => <SimulationsHtsResults simulation={simulation} />,
          },
          {
            key: "statut",
            title: "Statut",
            filtrable: true,
            renderCell: (simulation) => (
              <Tooltip id={simulation.id} title={`${translate(simulation.error?.code)} ${simulation.error?.description || ""}`} disabled={!simulation.error?.code}>
                <Badge title={translateTaskStatus(simulation.status)} status={MAPPING_STATUS_COLOR[simulation.status]} />
              </Tooltip>
            ),
          },
          {
            key: "rapportKey",
            title: "Simulat.",
            renderCell: (simulation) =>
              simulation.metadata?.results?.rapportKey && (
                <>
                  <button onClick={() => downloadSecuredFile(simulation.metadata?.results?.rapportKey)} className="border-[1px] border-blue-600 rounded-full p-2.5">
                    <HiOutlinePaperClip size={24} />
                  </button>
                </>
              ),
          },
          {
            key: "lancer",
            title: "Lancer",
            renderCell: (simulation) => {
              if (simulation.name === TaskName.AFFECTATION_HTS_SIMULATION) {
                return <SimulationHtsResultStartButton simulation={simulation} />;
              }
              return <HiPlay className="text-gray-400" size={50} />;
            },
          },
        ]}
      />
    </div>
  );
}
