import React, { useState } from "react";

import FileIcon from "../../../assets/FileIcon";
import Download from "../../../assets/icons/Download";
import ModalFilesPM from "../../volontaires/components/ModalFilesPM";

import { BsChevronDown, BsChevronUp } from "react-icons/bs";

export default function Phase2MilitaryPreparation({ young }) {
  const [militaryOpen, setMilitaryOpen] = useState(false);
  const [modalFiles, setModalFiles] = useState({ isOpen: false, title: "", nameFiles: "", initialValues: [] });
  return (
    <div className="mx-8 mt-7 rounded-lg bg-white">
      {modalFiles.nameFiles ? (
        <ModalFilesPM
          isOpen={modalFiles?.isOpen}
          onCancel={() => setModalFiles({ isOpen: false })}
          title={modalFiles?.title}
          readOnly={true}
          path={`/young/${young._id}/documents/${modalFiles?.nameFiles}`}
        />
      ) : null}
      {["WAITING_VERIFICATION", "WAITING_CORRECTION"].includes(young.statusMilitaryPreparationFiles) ? (
        <div className="flex flex-col px-7 py-3">
          <div className="text-lg font-medium text-gray-900">Dossier d&apos;éligibilité aux préparations militaires</div>
          <div className="text-sm text-gray-500">Ce dossier sera accessible après sa validation par le référent départemental du volontaire.</div>
        </div>
      ) : young.statusMilitaryPreparationFiles === "VALIDATED" ? (
        <div className="px-7 py-3">
          <div onClick={() => setMilitaryOpen((militaryOpen) => !militaryOpen)} className="flex cursor-pointer flex-row items-center justify-between">
            <div className="flex flex-row items-center gap-3">
              <div className="text-lg font-medium text-gray-900">Dossier d&apos;éligibilité aux préparations militaires</div>
              <div className="rounded-sm bg-green-500 px-1.5 py-[5px] text-xs text-white">Validé</div>
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
                name="Certificat médical de non contre-indication..."
                icon="autotest"
                filled={young.files.militaryPreparationFilesCertificate.length}
                onClick={() =>
                  setModalFiles({
                    isOpen: true,
                    title: "Certificat médical de non contre-indication...",
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
      ) : (
        <div className="flex flex-col px-7 py-3">
          <div className="text-lg font-medium text-gray-900">Dossier d&apos;éligibilité aux préparations militaires</div>
          <div className="text-sm text-gray-500">Ce dossier n&apos;est plus accessible.</div>
        </div>
      )}
    </div>
  );
}

function FileCard({ name, filled, icon, onClick, tw, description }) {
  return (
    <section className={`m-2  flex basis-1/4 flex-col items-center justify-between rounded-lg bg-gray-50 px-4 pt-4 text-center ${tw}`}>
      <FileIcon filled={filled} icon={icon} />
      <section>
        <p className="mt-2 text-base font-bold">{name}</p>
        {description ? <p className="ttext-xs mt-1 font-normal leading-4">{description}</p> : null}
      </section>
      <div className="text-gray-500">
        {filled} {filled > 1 ? "documents" : "document"}{" "}
      </div>
      <div></div>
      <div className="my-2 flex w-full flex-col items-end justify-end self-end">
        {filled > 0 ? (
          <div
            onClick={() => onClick()}
            className="border-3 self-endtransition relative flex cursor-pointer items-center justify-center rounded-full border-red-600 bg-blue-600 p-2 duration-150 ease-out hover:scale-110 hover:ease-in">
            <Download className=" bg-blue-600 text-indigo-100" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
