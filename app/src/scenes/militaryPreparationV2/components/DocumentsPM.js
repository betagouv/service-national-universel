import React from "react";
import FileCard from "./FileCard";
import { useSelector } from "react-redux";
import ModalDocument from "./ModalDocument";
import ModalInform from "./ModalInfom";
import { BsChevronDown } from "react-icons/bs";
import { translate } from "../../../utils";

export default function DocumentsPM({ docRef = null, showHelp = true, showFolder = true }) {
  const young = useSelector((state) => state.Auth.young);
  const [modalDocument, setModalDocument] = React.useState({ isOpen: false });
  const [modalInform, setModalInform] = React.useState({ isOpen: false });
  const [open, setOpen] = React.useState(showFolder);
  return (
    <>
      {showHelp ? (
        <div className="flex items-center justify-between" ref={docRef}>
          {showFolder ? (
            <>
              <div className="flex flex-col">
                <div className="text-lg leading-6 font-semibold">Dossier d&apos;éligibilité aux préparations militaires</div>
                <div className="text-sm leading-5 font-normal text-gray-500 mt-1">Pour candidater, veuillez téléverser les documents justificatifs ci-dessous.</div>
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
                <div className="text-lg leading-6 font-semibold">Dossier d&apos;éligibilité aux préparations militaires</div>
                <div className="text-xs font-normal bg-[#71C784] text-white px-2 py-[2px] rounded-sm">{translate(young.statusMilitaryPreparationFiles)}</div>
              </div>

              <div
                className="group flex items-center rounded-lg text-blue-600 text-center text-sm py-2 px-10 border-blue-600 border-[1px] hover:bg-blue-600 hover:text-white transition duration-100 ease-in-out"
                onClick={() => setOpen(!open)}>
                Voir mon dossier
                <BsChevronDown className={`ml-3 text-blue-600 group-hover:text-white h-5 w-5 ${!open ? "rotate-180" : ""}`} />
              </div>
            </>
          )}
        </div>
      ) : null}
      {open ? (
        <div className="flex flex-row flex-wrap lg:!flex-nowrap gap-4 my-4 w-full justify-between">
          <FileCard
            name="Pièce d’identité"
            icon="reglement"
            filled={young.militaryPreparationFilesIdentity.length}
            color={young.militaryPreparationFilesIdentity.length ? "text-blue-600 bg-white" : "bg-blue-600 text-white"}
            status={young.militaryPreparationFilesIdentity.length ? "Modifier" : "À renseigner"}
            onClick={() =>
              setModalDocument({
                isOpen: true,
                title: "Pièce d'identité",
                subTitle: "Déposez ici la copie d’une pièce d’identité en cours de validité (CNI, passeport).",
                name: "militaryPreparationFilesIdentity",
              })
            }
          />
          <FileCard
            name="Autorisation parentale"
            icon="image"
            filled={young.militaryPreparationFilesAuthorization.length}
            color={young.militaryPreparationFilesAuthorization.length ? "text-blue-600 bg-white" : "bg-blue-600 text-white"}
            status={young.militaryPreparationFilesAuthorization.length ? "Modifier" : "À renseigner"}
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
            filled={young.militaryPreparationFilesCertificate.length}
            color={young.militaryPreparationFilesCertificate.length ? "text-blue-600 bg-white" : "bg-blue-600 text-white"}
            status={young.militaryPreparationFilesCertificate.length ? "Modifier" : "À renseigner"}
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
            filled={young.militaryPreparationFilesCensus.length}
            color={young.militaryPreparationFilesCensus.length ? "text-blue-600 bg-white" : "bg-blue-600 text-white"}
            status={young.militaryPreparationFilesCensus.length ? "Modifier" : "À renseigner"}
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
    </>
  );
}
