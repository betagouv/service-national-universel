import { ReferentielService } from "@/services/ReferentielService";
import { DataTable } from "@snu/ds/admin";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { ReferentielRoutes } from "snu-lib";
import RapportCell from "../settings/operations/components/RapportCell";
import StatusCell from "../settings/operations/components/StatusCell";

export interface ImportTableProps {
  // data:
}

interface ImportRow {
  id: string;
  data: {
    typeFichier: string;
    importDate: string;
    statut: string;
    auteur: string;
    fichier: string;
    resultat: string;
  };
}

export default function ImportTable() {
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
    data: imports,
  } = useQuery<ReferentielRoutes["GetImports"]["response"]>({
    queryKey: ["import-si-snu", filters.action, sort],
    queryFn: async () => ReferentielService.getImports({ name: filters.action, order: sort }),
  });

  const importRows: ImportRow[] = useMemo(() => {
    return (
      imports?.map((importRow: ReferentielRoutes["GetImports"]["response"][0]) => ({
        id: importRow.id,
        data: {
          typeFichier: importRow.metadata?.parameters?.type || "",
          importDate: importRow.createdAt || "",
          statut: importRow.status || "",
          auteur: `${importRow.metadata?.parameters?.auteur?.prenom || ""} ${importRow.metadata?.parameters?.auteur?.nom || ""}`,
          fichier: importRow.metadata?.parameters?.fileName || "",
          resultat: importRow.metadata?.results?.rapportKey || "",
        },
      })) || []
    );
  }, [imports]);
  console.log(importRows);
  return (
    <DataTable<ImportRow>
      isLoading={isLoading}
      isError={!!error}
      rows={importRows}
      isSortable
      sort={sort}
      onSortChange={setSort}
      filters={filters}
      onFiltersChange={(filtersUpdated) => setFilters(filtersUpdated as any)}
      columns={[
        {
          key: "typeFichier",
          title: "Type de fichier",
          filtrable: true,
          filterKeys: [
            { key: "action", label: "Action", externalKey: "name", external: true },
            { key: "date", label: "Date" },
            { key: "author", label: "Auteur" },
          ],
          //   renderCell: (simulation) => <ActionCell simulation={simulation} session={session} />,
        },
        {
          key: "statut",
          title: "Statut",
          filtrable: true,
          renderCell: StatusCell,
        },
        {
          key: "auteur",
          title: "Auteur",
          filtrable: true,
          renderCell: StatusCell,
        },
        {
          key: "fichier",
          title: "Fichier",
          renderCell: RapportCell,
        },
        {
          key: "resultat",
          title: "Résultat",
          renderCell: RapportCell,
        },
      ]}
    />
  );
}
