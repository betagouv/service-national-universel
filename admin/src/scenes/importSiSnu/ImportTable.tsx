import UserCard from "@/components/UserCard";
import { ReferentielService } from "@/services/ReferentielService";
import { DataTable } from "@snu/ds/admin";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { ReferentielRoutes, TaskName } from "snu-lib";
import StatusCell from "../settings/operations/components/StatusCell";
import ImportFileTypeCell from "./ImportFileTypeCell";
import ImportRapportCell from "./ImportRapportCell";

interface ImportFileRow {
  id: string;
  data: {
    fileType?: string;
    importDate?: string;
    status?: string;
    author?: string;
    file?: string;
    report?: string;
    rawTask: ReferentielRoutes["GetImports"]["response"][0];
  };
}

export default function ImportTable({ lastTask }: { lastTask: ReferentielRoutes["GetImports"]["response"][0] | null }) {
  const [sort, setSort] = useState<"ASC" | "DESC">("DESC");
  const [filters, setFilters] = useState({
    createdAt: "",
    author: "",
    statut: "",
  });

  const {
    isFetching: isLoading,
    error,
    data: imports,
  } = useQuery<ReferentielRoutes["GetImports"]["response"]>({
    queryKey: ["import-si-snu", filters, sort, lastTask],
    queryFn: async () => ReferentielService.getImports({ name: TaskName.REFERENTIEL_IMPORT, sort }),
  });
  const importRows: ImportFileRow[] = useMemo<ImportFileRow[]>(() => {
    return (
      imports?.map((task: ReferentielRoutes["GetImports"]["response"][0]) => ({
        id: task.id,
        data: {
          fileType: task.metadata?.parameters?.type,
          importDate: task.createdAt,
          status: task.status,
          author: `${task.metadata?.parameters?.auteur?.prenom} ${task.metadata?.parameters?.auteur?.nom}`,
          file: task.metadata?.parameters?.fileKey,
          report: task.metadata?.results?.rapportKey,
          rawTask: task,
        },
      })) || []
    );
  }, [imports]);

  return (
    <DataTable<ImportFileRow>
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
          key: "fileType",
          title: "Type de fichier",
          filtrable: true,
          renderCell: (importRow) => <ImportFileTypeCell fileType={importRow.fileType} date={importRow.importDate} />,
        },
        {
          key: "status",
          title: "Statut",
          filtrable: true,
          renderCell: StatusCell,
        },
        {
          key: "author",
          title: "Auteur",
          filtrable: true,
          renderCell: (importRow) => {
            const user = {
              _id: importRow.rawTask?.metadata?.parameters?.auteur?.id,
              firstName: importRow.rawTask?.metadata?.parameters?.auteur?.prenom,
              lastName: importRow.rawTask?.metadata?.parameters?.auteur?.nom,
              role: importRow.rawTask?.metadata?.parameters?.auteur?.role,
            };
            return <UserCard user={user} />;
          },
        },
        {
          key: "file",
          title: "Fichier",
          renderCell: (importRow) => <ImportRapportCell fileKey={importRow.file} />,
        },
        {
          key: "report",
          title: "Résultat",
          renderCell: (importRow) => <ImportRapportCell fileKey={importRow.report} />,
        },
      ]}
    />
  );
}
