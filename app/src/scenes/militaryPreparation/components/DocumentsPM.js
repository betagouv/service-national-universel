import React from "react";
import FileCard from "./FileCard";
import { useSelector } from "react-redux";
import ModalDocument from "./ModalDocument";
import ModalInform from "./ModalInfom";
import { BsChevronDown } from "react-icons/bs";
import { translate } from "../../../utils";
import { AiOutlineInfoCircle } from "react-icons/ai";

export default function DocumentsPM({ docRef = null, showHelp = true }) {
  const young = useSelector((state) => state.Auth.young);
  const [modalDocument, setModalDocument] = React.useState({ isOpen: false });
  const [modalInform, setModalInform] = React.useState({ isOpen: false });
  const [open, setOpen] = React.useState();
  const [showFolder, setShowFolder] = React.useState(false);

  const theme = {
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

  React.useEffect(() => {
    if (showHelp === true) {
      setShowFolder(["VALIDATED", "WAITING_CORRECTION", "REFUSED"].includes(young.statusMilitaryPreparationFiles));
      setOpen(!["VALIDATED", "WAITING_CORRECTION", "REFUSED"].includes(young.statusMilitaryPreparationFiles));
    } else setOpen(true);
  }, [young]);

  return (
    <>
      <div className="w-full mb-4 " ref={docRef}>
        {showHelp ? (
          <>
            <div className="hidden md:flex items-center lg:justify-between flex-wrap lg:!flex-nowrap justify-center gap-4 w-full ">
              {!showFolder ? (
                <>
                  <div className="flex flex-col items-center lg:items-start">
                    <div className="text-lg leading-6 font-semibold">Dossier d&apos;éligibilité aux préparations militaires</div>
                    <div className="text-sm leading-5 font-normal text-gray-500 mt-1 text-center lg:!text-left">
                      Pour candidater, veuillez téléverser les documents justificatifs ci-dessous.
                    </div>
                  </div>

                  <div
                    className="rounded-lg text-blue-600 text-center text-sm py-2 px-10 border-blue-600 border-[1px] hover:bg-blue-600 hover:text-white transition duration-100 ease-in-out"
                    onClick={() => setModalInform({ isOpen: true })}>
                    En savoir plus
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-4">
                    <div className="text-lg leading-6 font-semibold ">Dossier d&apos;éligibilité aux préparations militaires</div>
                    <div
                      className={`text-xs font-normal ${theme.background[young.statusMilitaryPreparationFiles]} ${theme.text[young.statusMilitaryPreparationFiles]
                        } px-2 py-[2px] rounded-sm `}>
                      {translate(young.statusMilitaryPreparationFiles)}
                    </div>
                  </div>
                  {young.statusMilitaryPreparationFiles !== "REFUSED" ? (
                    <div
                      className="group flex items-center rounded-lg text-blue-600 text-center text-sm py-2 px-10 border-blue-600 border-[1px] hover:bg-blue-600 hover:text-white transition duration-100 ease-in-out"
                      onClick={() => setOpen(!open)}>
                      Voir mon dossier
                      <BsChevronDown className={`ml-3 text-blue-600 group-hover:text-white h-5 w-5 ${open ? "rotate-180" : ""}`} />
                    </div>
                  ) : null}
                </>
              )}
            </div>
            <div className="flex md:hidden items-center lg:justify-between flex-wrap lg:!flex-nowrap justify-center gap-4 " ref={docRef}>
              {!showFolder ? (
                <>
                  <div className="flex flex-col items-start">
                    <div className="text-[15px] leading-6 font-semibold">Dossier d&apos;éligibilité aux préparations militaires</div>
                    <p className="text-[13px] leading-5 font-normal text-gray-500 mt-1">
                      Pour candidater, veuillez téléverser les documents justificatifs ci-dessous.
                      <span className="inline-flex">
                        <div className="flex items-center gap-1 cursor-pointer underline ml-2" onClick={() => setModalInform({ isOpen: true })}>
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
                        className={`text-xs font-normal ${theme.background[young.statusMilitaryPreparationFiles]} ${theme.text[young.statusMilitaryPreparationFiles]
                          } px-2 py-[2px] rounded-sm `}>
                        {translate(young.statusMilitaryPreparationFiles)}
                      </div>
                      <div className="text-[15px] leading-6 font-semibold">Dossier d&apos;éligibilité aux préparations militaires</div>
                    </div>
                    {young.statusMilitaryPreparationFiles !== "REFUSED" ? (
                      <div className="flex items-center rounded-lg text-blue-600 text-center text-sm py-2 px-4 border-blue-600 border-[1px] " onClick={() => setOpen(!open)}>
                        {!open ? "Voir" : "Masquer"}
                        <BsChevronDown className={`ml-3 text-blue-600  h-5 w-5 ${open ? "rotate-180" : ""}`} />
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          </>
        ) : null}
        {open ? (
          <div className="flex flex-row overflow-x-auto gap-4 my-4 w-full justify-between ">
            <FileCard
              name="Pièce d’identité"
              icon="reglement"
              filled={young.files.militaryPreparationFilesIdentity.length}
              color={young.files.militaryPreparationFilesIdentity.length ? "text-blue-600 bg-white" : "bg-blue-600 text-white"}
              status={young.files.militaryPreparationFilesIdentity.length ? "Modifier" : "À renseigner"}
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
              filled={young.files.militaryPreparationFilesAuthorization.length}
              color={young.files.militaryPreparationFilesAuthorization.length ? "text-blue-600 bg-white" : "bg-blue-600 text-white"}
              status={young.files.militaryPreparationFilesAuthorization.length ? "Modifier" : "À renseigner"}
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
              name="Certifical médical de non contre-indication..."
              icon="autotest"
              filled={young.files.militaryPreparationFilesCertificate.length}
              color={young.files.militaryPreparationFilesCertificate.length ? "text-blue-600 bg-white" : "bg-blue-600 text-white"}
              status={young.files.militaryPreparationFilesCertificate.length ? "Modifier" : "À renseigner"}
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
              filled={young.files.militaryPreparationFilesCensus.length}
              color={young.files.militaryPreparationFilesCensus.length ? "text-blue-600 bg-white" : "bg-blue-600 text-white"}
              status={young.files.militaryPreparationFilesCensus.length ? "Modifier" : "À renseigner"}
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
