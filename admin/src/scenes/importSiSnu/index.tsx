import Breadcrumbs from "@/components/Breadcrumbs";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { ReferentielService } from "@/services/ReferentielService";
import { Container } from "@snu/ds/admin";
import React, { useState } from "react";
import { BiLoaderAlt } from "react-icons/bi";
import { useToggle } from "react-use";
import ImportSelectModal from "./ImportSelectModal";
import ImportTable from "./ImportTable";

export default function ImportSiSnu() {
  const [showModal, toggleModal] = useToggle(false);
  const [isLoading, setIsLoading] = useState(false);

  const [sort, setSort] = useState<"ASC" | "DESC">("DESC");
  const [filters, setFilters] = useState({
    // action: currentAction,
    createdAt: "",
    author: "",
    statut: "",
  });

  const handleImportFile = async (importType: string, file: File) => {
    console.log("Selected file:", file);
    const importFileResponse = await ReferentielService.importFile(importType, file);
  };

  //   const {
  //     isFetching: isLoading,
  //     error,
  //     data: simulations,
  //   } = useQuery<ReferentielRoutes["Import"]["response"]>({
  //     queryFn: async () => ReferentielService.importFile(session._id!, { name: filters.action, sort }),
  //   });

  //   const { isPending, mutate } = useMutation({
  //     mutationFn: async () => {
  //       return await ReferentielService.importFile(session._id!, { name: filters.action, sort });
  //     },
  //     onSuccess: () => {
  //       toastr.success("Le fichier a bien été ajouté", "", { timeOut: 5000 });
  //       queryClient.invalidateQueries({ queryKey: affectationKey });
  //       toggleModal(false);
  //     },
  //     onError: (error: any) => {
  //       capture(error);
  //       toastr.error("Une erreur est survenue lors de l'ajout du traitement", translate(JSON.parse(error.message).message), { timeOut: 5000 });
  //     },
  //   });

  //   const onSubmit = () => {
  //     setIsLoading(true);
  //     setTimeout(() => {
  //       setIsLoading(false);
  //     }, 2000);
  //   };

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
      <Container>
        <div className="flex flex-col gap-8 ">
          <ImportTable />
        </div>
      </Container>
      <div className="text-2xl font-bold leading-7 text-gray-900">{showModal && <ImportSelectModal onSubmit={handleImportFile} onClose={toggleModal} />}</div>
    </>
  );
}
