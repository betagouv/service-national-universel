import Loader from "@/components/Loader";
import { Container, Header, Page } from "@snu/ds/admin";
import React, { useRef, useState } from "react";
import { BsPeopleFill } from "react-icons/bs";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { ROLES } from "snu-lib";
import useClass from "../utils/useClass";
import { FileUploadPanel } from "./FileUploadPanel";
import { ValidationFile } from "./FileValidationErrorsList";
import { MappingModal } from "./MappingModal";
import { SuccessModal } from "./SuccessModal";
import { useFileUploadHandler } from "./useFileUploadHandler";

export default function InscriptionEnMasse() {
  const { id } = useParams<{ id: string }>();
  // @ts-expect-error property does not exist
  const user = useSelector((state) => state.Auth.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isErrorRetry, setIsErrorRetry] = useState(false);

  const { data: classe, isLoading: isClasseLoading } = useClass(id);

  const { importState, handleFileUpload, handleRetryImportWithMapping, closeMapping, closeSuccess } = useFileUploadHandler({
    classeId: id,
  });

  const isValidating = importState.status === "validating";

  if (isClasseLoading) return <Loader />;
  if (!classe) return <Container>Classe non trouvée</Container>;

  if (![ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN].includes(user.role)) {
    return <Container>Vous n'avez pas les droits pour accéder à cette page.</Container>;
  }

  const handleFileUploadClick = () => {
    fileInputRef.current!.value = "";
    fileInputRef.current?.click();
    setIsErrorRetry(false);
  };

  const handleErrorRetry = () => {
    fileInputRef.current!.value = "";
    fileInputRef.current?.click();
    setIsErrorRetry(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    handleFileUpload(file);
  };

  const confirmImport = () => {
    // TODO: Implement the actual student import logic
    console.log(`Importing ${importState.status === "success" ? importState.studentCount : 0} students...`);
    closeSuccess();
  };

  return (
    <Page>
      <div className="relative">
        <Header
          title={"Inscrire les élèves en masse"}
          breadcrumb={[
            { title: "Séjours" },
            {
              title: "Classes",
              to: "/classes",
            },
            {
              title: "Fiche de la classe",
              to: `/classes/${id}`,
            },
            { title: "Inscrire les élèves en masse" },
          ]}
        />
        <div className="absolute top-0 right-8 py-4">
          <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm border border-gray-200">
            <BsPeopleFill size={20} className="text-pink-500" />
            <span className="text-gray-500 font-normal text-sm max-w-[300px] truncate">{classe.name}</span>
          </div>
        </div>
      </div>

      <Container className="mt-6">
        {importState.status === "error" || (isErrorRetry && isValidating) ? (
          <div className="max-w-4xl mx-auto">
            <ValidationFile errorMessage={importState.status === "error" ? importState.errors : []} onRetry={handleErrorRetry} isValidating={isValidating} />
          </div>
        ) : (
          <FileUploadPanel handleFileUploadClick={handleFileUploadClick} isValidating={isValidating} />
        )}
      </Container>

      <SuccessModal
        isOpen={importState.status === "success"}
        onClose={closeSuccess}
        onConfirm={confirmImport}
        studentCount={importState.status === "success" ? importState.studentCount : 0}
      />

      {importState.status === "mapping" && (
        <MappingModal
          isOpen={true}
          onClose={closeMapping}
          onRetry={(mappings) => handleRetryImportWithMapping(mappings, fileInputRef.current?.files?.[0])}
          fileColumns={importState.columns}
          isValidating={isValidating}
        />
      )}
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx" className="hidden" />
    </Page>
  );
}
