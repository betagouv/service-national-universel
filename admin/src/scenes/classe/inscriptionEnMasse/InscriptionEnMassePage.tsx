import { Container, Header, Page } from "@snu/ds/admin";
import React, { useCallback, useRef } from "react";
import { BsPeopleFill } from "react-icons/bs";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { ROLES } from "snu-lib";
import useClass from "../utils/useClass";
import { FileUploadPanel } from "./FileUploadPanel";
import { ColumnMapping, MappingModal } from "./MappingModal";
import { SuccessModal } from "./SuccessModal";
import { ValidationFile } from "./FileValidationErrorsList";
import { useFileUploadHandler } from "./useFileUploadHandler";
import Loader from "@/components/Loader";

export default function InscriptionEnMasse() {
  const { id } = useParams<{ id: string }>();
  // @ts-expect-error property does not exist
  const user = useSelector((state) => state.Auth.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Always call hooks before any conditional returns
  const { data: classe, isLoading: isClasseLoading } = useClass(id);

  const handleRetryImport = useCallback((mappings: ColumnMapping[]) => {
    console.log("Retrying import with mappings:", mappings);
  }, []);

  const {
    showErrorDisplay,
    errorMessage,
    fileColumns,
    mappingModalOpen,
    studentCount,
    successModalOpen,
    handleFileChange,
    setMappingModalOpen,
    setSuccessModalOpen,
    setStudentCount,
  } = useFileUploadHandler({
    classeId: id,
    onMappingNeeded: (columns) => {
      console.log("Mapping needed for columns:", columns);
    },
    onSuccess: (count) => {
      console.log(`Successfully processed ${count} students`);
    },
    onError: (errors) => {
      console.error("File processing errors:", errors);
    },
  });

  if (isClasseLoading) return <Loader />;
  if (!classe) return <Container>Classe non trouvée</Container>;

  if (![ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN].includes(user.role)) {
    return <Container>Vous n'avez pas les droits pour accéder à cette page.</Container>;
  }

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRetryUpload = () => {
    // setShowErrorDisplay(false);
    handleFileUploadClick();
  };

  const closeSuccessModal = () => {
    setSuccessModalOpen(false);
  };

  const closeMappingModal = () => {
    setMappingModalOpen(false);
  };

  const confirmImport = () => {
    // TODO: Implement the actual student import logic
    console.log(`Importing ${studentCount} students...`);
    setSuccessModalOpen(false);
    // You could show a loading state or another confirmation message here
  };

  const onRetryMapping = (mappings: ColumnMapping[]) => {
    handleRetryImport(mappings);
    setMappingModalOpen(false);
    // Example of continuing the flow after mapping
    setStudentCount(24);
    setSuccessModalOpen(true);
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
        {showErrorDisplay ? (
          <div className="max-w-4xl mx-auto">
            <ValidationFile errorMessage={errorMessage} onRetry={handleRetryUpload} />
          </div>
        ) : (
          <FileUploadPanel handleFileUploadClick={handleFileUploadClick} />
        )}
      </Container>

      <SuccessModal isOpen={successModalOpen} onClose={closeSuccessModal} onConfirm={confirmImport} studentCount={studentCount} />
      <MappingModal isOpen={mappingModalOpen} onClose={closeMappingModal} onRetry={onRetryMapping} columns={fileColumns} />
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx" className="hidden" />
    </Page>
  );
}
