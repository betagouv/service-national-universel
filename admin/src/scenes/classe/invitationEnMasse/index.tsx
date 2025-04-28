import React, { useRef, useState } from "react";
import { BsPeopleFill } from "react-icons/bs";
import { HiOutlineDownload, HiOutlineUpload } from "react-icons/hi";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROLES } from "snu-lib";

import Loader from "@/components/Loader";
import { Container, Header, Page } from "@snu/ds/admin";
import useClass from "../utils/useClass";
import { ErrorModal, ImportEnMasseError } from "./ErrorModal";
import { SuccessModal } from "./SuccessModal";
import { MappingErrorModal, ColumnMapping } from "./MappingErrorModal";

export default function InvitationEnMasse() {
  const { id } = useParams<{ id: string }>();
  // @ts-expect-error property does not exist
  const user = useSelector((state) => state.Auth.user);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Error modal state
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<ImportEnMasseError[]>([]);

  // Success modal state
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [studentCount, setStudentCount] = useState(0);

  // Mapping modal state
  const [mappingModalOpen, setMappingModalOpen] = useState(false);
  const [fileColumns, setFileColumns] = useState<string[]>([]);

  // Always call hooks before any conditional returns
  const { data: classe, isLoading: isClasseLoading } = useClass(id);
  const isLoading = isClasseLoading;

  if (![ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN].includes(user.role)) {
    return <div>Vous n'avez pas les droits pour accéder à cette page.</div>;
  }

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log("File selected:", file);
      event.target.value = "";
      // TODO: handle file upload

      // Example of handling different scenarios:
      try {
        // Simulate different responses based on file name for demonstration

        // Mapping error example: file needs column mapping
        if (file.name.includes("mapping")) {
          setFileColumns(["prenom_élève", "nom_élève", "date_naissance", "sexe"]);
          setMappingModalOpen(true);
        }
        // Success example
        else if (file.name.includes("success")) {
          setStudentCount(24); // Example count
          setSuccessModalOpen(true);
        }
        // Error example
        else {
          // Example error response
          const errorMsg: ImportEnMasseError[] = [
            {
              category: "Prénom",
              details: [
                {
                  line: 1,
                  message: 'Le champ "Prénom" est obligatoire.',
                },
              ],
            },
            {
              category: "Genre",
              details: [
                {
                  line: 2,
                  message: 'Le champ "Genre" doit contenir uniquement "F" ou "M".',
                },
              ],
            },
          ];
          throw new Error(JSON.stringify(errorMsg));
        }
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : JSON.stringify([]);
        setErrorMessage(JSON.parse(errorMsg));
        setErrorModalOpen(true);
      }
    }
  };

  const closeErrorModal = () => {
    setErrorModalOpen(false);
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

  const handleRetryImport = (mappings: ColumnMapping[]) => {
    console.log("Retrying import with mappings:", mappings);
    setMappingModalOpen(false);

    // TODO: Nécessaire pour les tickets suivants
    setStudentCount(24);
    setSuccessModalOpen(true);
  };

  if (isLoading) return <Loader />;
  if (!classe) return <div>Classe non trouvée</div>;

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
        <div className="py-12 px-4 max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <BsPeopleFill size={40} className="text-gray-800" />
          </div>

          <h2 className="text-2xl font-bold mb-6">Importez votre liste d'élèves par fichier</h2>

          <p className="text-lg mb-2">
            Ce fichier doit lister les élèves d'<span className="font-bold">une seule et même classe</span>,
          </p>
          <p className="text-lg mb-6">
            et comporter les informations suivantes : <span className="font-bold">Prénom, Nom, Date de naissance</span> et <span className="font-bold">Genre</span>.
          </p>

          <p className="text-md mb-8 text-gray-600">Format .xlsx • Jusqu'à 5Mo</p>

          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx" className="hidden" />

          <div className="flex flex-col md:flex-row items-center justify-center gap-4">
            <button className="flex items-center justify-center bg-white text-blue-600 border border-blue-600 px-4 py-3 rounded-lg hover:bg-blue-50 transition w-full md:w-auto">
              <HiOutlineDownload size={20} className="mr-2" />
              Télécharger le modèle d'import
            </button>

            <span className="text-gray-600 my-2 md:my-0">puis</span>

            <button
              onClick={handleFileUploadClick}
              className="flex items-center justify-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition w-full md:w-auto">
              <HiOutlineUpload size={20} className="mr-2" />
              Téléverser votre fichier
            </button>
          </div>
        </div>
      </Container>

      {/* Modals */}
      <ErrorModal isOpen={errorModalOpen} onClose={closeErrorModal} errorMessage={errorMessage} />
      <SuccessModal isOpen={successModalOpen} onClose={closeSuccessModal} onConfirm={confirmImport} studentCount={studentCount} />
      <MappingErrorModal isOpen={mappingModalOpen} onClose={closeMappingModal} onRetry={handleRetryImport} columns={fileColumns} />
    </Page>
  );
}
