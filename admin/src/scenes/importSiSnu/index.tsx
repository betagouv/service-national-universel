import Breadcrumbs from "@/components/Breadcrumbs";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { ReferentielService } from "@/services/ReferentielService";
import { Container } from "@snu/ds/admin";
import React, { useState } from "react";
import { BiLoaderAlt } from "react-icons/bi";
import { useToggle } from "react-use";
import { ReferentielRoutes, ReferentielTaskType } from "snu-lib";
import ImportSelectModal from "./ImportSelectModal";
import ImportTable from "./ImportTable";
import { toastr } from "react-redux-toastr";

export default function ImportSiSnu() {
  const [showModal, toggleModal] = useToggle(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastTask, setLastTask] = useState<ReferentielRoutes["GetImports"]["response"][0] | null>(null);

  const handleImportFile = async (importType: string, file: File) => {
    console.log("Selected file:", file);
    setIsLoading(true);
    toastr.info("Import en cours", "Veuillez patienter...");
    let importFileResponse: ReferentielRoutes["GetImports"]["response"][0] | null = null;
    try {
      importFileResponse = await ReferentielService.importFile(ReferentielTaskType.IMPORT_CLASSES, file);
    } catch (error) {
      toastr.clean();
      toastr.error("Erreur", "Le fichier doit contenir les colonnes: " + error.description);
    } finally {
      setIsLoading(false);
    }

    setLastTask(importFileResponse);
    toggleModal(false);
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
            <ImportTable lastTask={lastTask} />
          </div>
        </Container>
      </div>
      <div className="text-2xl font-bold leading-7 text-gray-900">{showModal && <ImportSelectModal onSubmit={handleImportFile} onClose={toggleModal} />}</div>
    </>
  );
}
