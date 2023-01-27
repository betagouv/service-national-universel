import React, { useState } from "react";

import FileIcon from "../../../assets/FileIcon";
import Download from "../../../assets/icons/Download";
import ModalFilesPM from "../../volontaires/components/ModalFilesPM";

import { BsChevronDown, BsChevronUp } from "react-icons/bs";

export default function Phase2MilitaryPreparation({ young }) {
  const [militaryOpen, setMilitaryOpen] = useState(false);
  const [modalFiles, setModalFiles] = useState({ isOpen: false, title: "", nameFiles: "", initialValues: [] });
  return (
    <div className="bg-white mx-8 mt-7 rounded-lg">
      <ModalFilesPM
        isOpen={modalFiles?.isOpen}
        onCancel={() => setModalFiles({ isOpen: false })}
        title={modalFiles?.title}
        readOnly={true}
        path={`/young/${young._id}/documents/${modalFiles?.nameFiles}`}
      />
      {["WAITING_VERIFICATION", "WAITING_CORRECTION"].includes(young.statusMilitaryPreparationFiles) ? (
        <div className="flex flex-col px-7 py-3">
          <div className="font-medium text-lg text-gray-900">Dossier d&apos;éligibilité aux préparations militaires</div>
          <div className="text-sm text-gray-500">Ce dossier sera accessible après sa validation par le référent départemental du volontaire.</div>
        </div>
      ) : null}
      {young.statusMilitaryPreparationFiles === "REFUSED" || young.statusPhase2 === "VALIDATED" ? (
        <div className="flex flex-col px-7 py-3">
          <div className="font-medium text-lg text-gray-900">Dossier d&apos;éligibilité aux préparations militaires</div>
          <div className="text-sm text-gray-500">Ce dossier n&apos;est plus accessible.</div>
        </div>
      ) : null}
      {young.statusMilitaryPreparationFiles === "VALIDATED" ? (
        <div className="px-7 py-3">
          <div onClick={() => setMilitaryOpen((militaryOpen) => !militaryOpen)} className="flex flex-row justify-between items-center cursor-pointer">
            <div className="flex flex-row items-center gap-3">
              <div className="font-medium text-lg text-gray-900">Dossier d&apos;éligibilité aux préparations militaires</div>
              <div className="text-xs text-white bg-green-500 px-1.5 py-[5px] rounded-sm">Validé</div>
            </div>
            {militaryOpen ? <BsChevronUp /> : <BsChevronDown />}
          </div>

          {militaryOpen && (
            <div className="flex flex-row items-stretch justify-center ">
              <FileCard
                name="Pièce d'identité"
                icon="reglement"
                filled={young.files.militaryPreparationFilesIdentity.length}
                onClick={() =>
                  setModalFiles({
                    isOpen: true,
                    title: "Pièce d'identité",
                    nameFiles: "militaryPreparationFilesIdentity",
                  })
                }
              />
              <FileCard
                name="Autorisation parentale"
                icon="image"
                filled={young.files.militaryPreparationFilesAuthorization.length}
                onClick={() =>
                  setModalFiles({
                    isOpen: true,
                    title: "Autorisation parentale",
                    nameFiles: "militaryPreparationFilesAuthorization",
                    initialValues: young.files.militaryPreparationFilesAuthorization,
                  })
                }
              />
              <FileCard
                name="Certifical médical de non contre-indication..."
                icon="autotest"
                filled={young.files.militaryPreparationFilesCertificate.length}
                onClick={() =>
                  setModalFiles({
                    isOpen: true,
                    title: "Certifical médical de non contre-indication...",
                    nameFiles: "militaryPreparationFilesCertificate",
                    initialValues: young.files.militaryPreparationFilesCertificate,
                  })
                }
              />
              <FileCard
                name="Attestation de recensement"
                icon="sanitaire"
                filled={young.files.militaryPreparationFilesCensus.length}
                onClick={() =>
                  setModalFiles({
                    isOpen: true,
                    title: "Attestation de recensement",
                    nameFiles: "militaryPreparationFilesCensus",
                    initialValues: young.files.militaryPreparationFilesCensus,
                  })
                }
              />
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function FileCard({ name, filled, icon, onClick, tw, description }) {
  return (
    <section className={`basis-1/4  bg-gray-50 rounded-lg m-2 text-center flex flex-col items-center justify-between px-4 pt-4 ${tw}`}>
      <FileIcon filled={filled} icon={icon} />
      <section>
        <p className="text-base font-bold mt-2">{name}</p>
        {description ? <p className="ttext-xs leading-4 font-normal mt-1">{description}</p> : null}
      </section>
      <div className="text-gray-500">
        {filled} {filled > 1 ? "documents" : "document"}{" "}
      </div>
      <div></div>
      <div className="flex flex-col w-full justify-end items-end self-end my-2">
        {filled > 0 ? (
          <div
            onClick={() => onClick()}
            className="relative border-red-600 border-3 self-endtransition duration-150 flex rounded-full bg-blue-600 p-2 items-center justify-center hover:scale-110 ease-out hover:ease-in cursor-pointer">
            <Download className=" text-indigo-100 bg-blue-600" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
