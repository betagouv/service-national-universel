import Breadcrumbs from "@/components/Breadcrumbs";
import UserCard from "@/components/UserCard";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { ReferentielService } from "@/services/ReferentielService";
import { Container, DataTable } from "@snu/ds/admin";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { BiLoaderAlt } from "react-icons/bi";
import { useToggle } from "react-use";
import { ReferentielRoutes, TaskName } from "snu-lib";
import StatusCell from "../settings/operations/components/StatusCell";
import ImportFileTypeCell from "./ImportFileTypeCell";
import ImportRapportCell from "./ImportRapportCell";
import ImportSelectModal from "./ImportSelectModal";

interface ImportFileRow {
  id: string;
  data: {
    fileType?: string;
    createdAt?: string;
    status?: string;
    author?: string;
    file?: string;
    report?: string;
    rawTask: ReferentielRoutes["GetImports"]["response"][0];
  };
}

export default function ImportSiSnu() {
  const [showModal, toggleModal] = useToggle(false);
  const [lastTask, setLastTask] = useState<ReferentielRoutes["GetImports"]["response"][0] | null>(null);

  const [sort, setSort] = useState<"ASC" | "DESC">("DESC");
  const [filters, setFilters] = useState({
    fileType: "",
    author: "",
    statut: "",
    createdAt: "",
  });

  const {
    isFetching: isLoading,
    error,
    data: imports,
  } = useQuery<ReferentielRoutes["GetImports"]["response"]>({
    queryKey: ["import-si-snu", filters, sort, lastTask],
    queryFn: async () => ReferentielService.getImports({ name: TaskName.REFERENTIEL_IMPORT, sort }),
    refetchInterval: 3000,
    enabled: !showModal,
  });
  const importRows: ImportFileRow[] = useMemo<ImportFileRow[]>(() => {
    return (
      imports?.map((task: ReferentielRoutes["GetImports"]["response"][0]) => ({
        id: task.id,
        data: {
          fileType: task.metadata?.parameters?.type,
          createdAt: task.createdAt,
          importDate: new Date(task.createdAt).toLocaleDateString("fr-FR"),
          status: task.status,
          author: `${task.metadata?.parameters?.auteur?.prenom} ${task.metadata?.parameters?.auteur?.nom}`,
          file: task.metadata?.parameters?.fileKey,
          report: task.metadata?.results?.rapportKey,
          rawTask: task,
        },
      })) || []
    );
  }, [imports]);

  const handleSuccess = (lastTask: ReferentielRoutes["Import"]["response"]) => {
    setLastTask(lastTask);
    toggleModal();
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Import SI-SNU" }]} />
      <div className="flex w-full flex-col px-8 pb-8">
        <div className="flex items-center justify-between py-8">
          <div className="text-2xl font-bold leading-7 text-gray-900">Import SI-SNU</div>
          <ButtonPrimary disabled={isLoading} className="h-[50px] w-[300px]" onClick={toggleModal}>
            {isLoading && <BiLoaderAlt className="h-4 w-4 animate-spin" />}
            Importer un fichier SI-SNU
          </ButtonPrimary>
        </div>
      </div>
      <div className="px-8">
        <Container>
          <div className="flex flex-col gap-8 ">
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
                  renderCell: (importRow) => <ImportFileTypeCell fileType={importRow.fileType} date={importRow.createdAt} />,
                  filterKeys: [
                    { key: "fileType", label: "Type de fichier" },
                    { key: "importDate", label: "Date" },
                  ],
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
          </div>
        </Container>
      </div>
      <div className="text-2xl font-bold leading-7 text-gray-900">{showModal && <ImportSelectModal onSuccess={handleSuccess} onClose={toggleModal} />}</div>
    </>
  );
}
