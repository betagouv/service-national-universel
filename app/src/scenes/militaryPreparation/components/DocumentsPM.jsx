import React from "react";
import { AiOutlineInfoCircle } from "react-icons/ai";
import { BsChevronDown } from "react-icons/bs";
import { useSelector } from "react-redux";
import { translateStatusMilitaryPreparationFiles } from "../../../utils";
import FileCard from "./FileCard";
import ModalDocument from "./ModalDocument";
import ModalInform from "./ModalInfom";

export const theme = {
  background: {
    WAITING_VALIDATION: "bg-sky-100",
    WAITING_CORRECTION: "bg-[#FD7A02]",
    VALIDATED: "bg-[#71C784]",
    REFUSED: "bg-red-500",
  },
  text: {
    WAITING_VALIDATION: "text-sky-600",
    WAITING_CORRECTION: "text-white",
    VALIDATED: "text-white",
    REFUSED: "text-white",
  },
};

export default function DocumentsPM({ docRef = null, showHelp = true }) {
  const young = useSelector((state) => state.Auth.young);
  const [modalDocument, setModalDocument] = React.useState({ isOpen: false });
  const [modalInform, setModalInform] = React.useState({ isOpen: false });
  const [open, setOpen] = React.useState();
  const [showFolder, setShowFolder] = React.useState(false);

  React.useEffect(() => {
    if (showHelp === true) {
      setShowFolder(["VALIDATED", "WAITING_CORRECTION", "REFUSED"].includes(young.statusMilitaryPreparationFiles));
      setOpen(!["VALIDATED", "WAITING_CORRECTION", "REFUSED"].includes(young.statusMilitaryPreparationFiles));
    } else setOpen(true);
  }, [young]);

  return (
    <>
      <div className="mb-4 w-full " ref={docRef}>
        {showHelp ? (
          <>
            <div className="hidden w-full flex-wrap items-center justify-center gap-4 md:flex lg:!flex-nowrap lg:justify-between ">
              {!showFolder ? (
                <>
                  <div className="flex flex-col items-center lg:items-start">
                    <div className="text-lg font-semibold leading-6">Dossier d&apos;éligibilité aux préparations militaires</div>
                    <div className="mt-1 text-center text-sm font-normal leading-5 text-gray-500 lg:!text-left">
                      Pour candidater, veuillez téléverser les documents justificatifs ci-dessous.
                    </div>
                  </div>

                  <div
                    className="rounded-lg border-[1px] border-blue-600 py-2 px-10 text-center text-sm text-blue-600 transition duration-100 ease-in-out hover:bg-blue-600 hover:text-white"
                    onClick={() => setModalInform({ isOpen: true })}>
                    En savoir plus
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="text-lg font-semibold leading-6 ">Dossier d&apos;éligibilité aux préparations militaires</div>
                    <div
                      className={`text-xs font-normal ${theme.background[young.statusMilitaryPreparationFiles]} ${
                        theme.text[young.statusMilitaryPreparationFiles]
                      } rounded-sm px-2 py-[2px] `}>
                      {translateStatusMilitaryPreparationFiles(young.statusMilitaryPreparationFiles)}
                    </div>
                  </div>
                  {young.statusMilitaryPreparationFiles !== "REFUSED" ? (
                    <div
                      className="group flex items-center rounded-lg border-[1px] border-blue-600 py-2 px-10 text-center text-sm text-blue-600 transition duration-100 ease-in-out hover:bg-blue-600 hover:text-white"
                      onClick={() => setOpen(!open)}>
                      Voir mon dossier
                      <BsChevronDown className={`ml-3 h-5 w-5 text-blue-600 group-hover:text-white ${open ? "rotate-180" : ""}`} />
                    </div>
                  ) : null}
                </>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 md:hidden lg:!flex-nowrap lg:justify-between " ref={docRef}>
              {!showFolder ? (
                <>
                  <div className="flex flex-col items-start">
                    <div className="text-[15px] font-semibold leading-6">Dossier d&apos;éligibilité aux préparations militaires</div>
                    <p className="mt-1 text-[13px] font-normal leading-5 text-gray-500">
                      Pour candidater, veuillez téléverser les documents justificatifs ci-dessous.
                      <span className="inline-flex">
                        <div className="ml-2 flex cursor-pointer items-center gap-1 underline" onClick={() => setModalInform({ isOpen: true })}>
                          <AiOutlineInfoCircle /> En savoir plus
                        </div>
                      </span>
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-end gap-2">
                    <div className="flex flex-col items-start gap-2">
                      <div
                        className={`text-xs font-normal ${theme.background[young.statusMilitaryPreparationFiles]} ${
                          theme.text[young.statusMilitaryPreparationFiles]
                        } rounded-sm px-2 py-[2px] `}>
                        {translateStatusMilitaryPreparationFiles(young.statusMilitaryPreparationFiles)}
                      </div>
                      <div className="text-[15px] font-semibold leading-6">Dossier d&apos;éligibilité aux préparations militaires</div>
                    </div>
                    {young.statusMilitaryPreparationFiles !== "REFUSED" ? (
                      <div className="flex items-center rounded-lg border-[1px] border-blue-600 py-2 px-4 text-center text-sm text-blue-600 " onClick={() => setOpen(!open)}>
                        {!open ? "Voir" : "Masquer"}
                        <BsChevronDown className={`ml-3 h-5  w-5 text-blue-600 ${open ? "rotate-180" : ""}`} />
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </>
        ) : null}
        {open ? (
          <div className="my-4 flex w-full flex-row justify-between gap-4 overflow-x-auto ">
            <FileCard
              name="Pièce d’identité"
              icon="reglement"
              filled={young.files?.militaryPreparationFilesIdentity?.length}
              color={young.files?.militaryPreparationFilesIdentity?.length ? "text-blue-600 bg-white" : "bg-blue-600 text-white"}
              status={young.files?.militaryPreparationFilesIdentity?.length ? "Modifier" : "À renseigner"}
              onClick={() =>
                setModalDocument({
                  isOpen: true,
                  title: "Pièce d'identité",
                  subTitle: "Déposez ici la copie d’une pièce d’identité en cours de validité (CNI recto/verso, passeport) .",
                  name: "militaryPreparationFilesIdentity",
                })
              }
            />
            <FileCard
              name="Autorisation parentale"
              icon="image"
              filled={young.files?.militaryPreparationFilesAuthorization?.length}
              color={young.files?.militaryPreparationFilesAuthorization?.length ? "text-blue-600 bg-white" : "bg-blue-600 text-white"}
              status={young.files?.militaryPreparationFilesAuthorization?.length ? "Modifier" : "À renseigner"}
              onClick={() =>
                setModalDocument({
                  isOpen: true,
                  title: "Autorisation parentale pour effectuer une préparation militaire",
                  subTitle: "Téléchargez puis téléversez le formulaire rempli par votre représentant légal consentant à votre participation à une préparation militaire.",
                  name: "militaryPreparationFilesAuthorization",
                  template: "https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/Modele_d_autorisation_parentale.pdf",
                })
              }
            />
            <FileCard
              name="Certificat médical de non contre-indication..."
              icon="autotest"
              filled={young.files?.militaryPreparationFilesCertificate?.length}
              color={young.files?.militaryPreparationFilesCertificate?.length ? "text-blue-600 bg-white" : "bg-blue-600 text-white"}
              status={young.files?.militaryPreparationFilesCertificate?.length ? "Modifier" : "À renseigner"}
              onClick={() =>
                setModalDocument({
                  isOpen: true,
                  title: "Certificat médical de non contre indication à la pratique sportive",
                  subTitle: "Téléchargez puis téléversez le formulaire rempli par votre médecin traitant certifiant l’absence de contre-indication à la pratique sportive.",
                  name: "militaryPreparationFilesCertificate",
                  template: "https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/certificat_medical.pdf",
                })
              }
            />
            <FileCard
              name="Attestation de recensement"
              icon="sanitaire"
              filled={young.files?.militaryPreparationFilesCensus?.length}
              color={young.files?.militaryPreparationFilesCensus?.length ? "text-blue-600 bg-white" : "bg-blue-600 text-white"}
              status={young.files?.militaryPreparationFilesCensus?.length ? "Modifier" : "À renseigner"}
              description="Facultatif"
              onClick={() =>
                setModalDocument({
                  isOpen: true,
                  title: "Attestation de recensement",
                  subTitle: "Déposez ici la copie de votre attestation de recensement.",
                  subsubTitle: "À défaut, à téléverser dès réception du document ou à apporter pour le 1er jour de la préparation militaire.",
                  name: "militaryPreparationFilesCensus",
                })
              }
            />
            <ModalDocument
              isOpen={modalDocument?.isOpen}
              title={modalDocument?.title}
              subTitle={modalDocument?.subTitle}
              subsubTitle={modalDocument?.subsubTitle}
              name={modalDocument?.name}
              young={young}
              template={modalDocument?.template}
              onCancel={() => setModalDocument({ isOpen: false })}
            />
          </div>
        ) : null}
        <ModalInform isOpen={modalInform?.isOpen} onCancel={() => setModalInform({ isOpen: false })} />
      </div>
    </>
  );
}
