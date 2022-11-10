import Cni from "../../../assets/icons/Cni";
import { AddButton, DeleteButton, DownloadButton, MiniTitle, MoreButton } from "./commons";
import React, { useEffect, useState } from "react";
import api from "../../../services/api";
import { download, translate } from "snu-lib";
import { toastr } from "react-redux-toastr";
import CorrectionRequest from "./CorrectionRequest";
import PencilAlt from "../../../assets/icons/PencilAlt";
import CorrectedRequest from "./CorrectedRequest";
import { Modal } from "reactstrap";
import { BorderButton, PlainButton } from "./Buttons";
import ConfirmationModal from "./ConfirmationModal";
import Warning from "../../../assets/icons/Warning";
import { capture } from "../../../sentry";
import dayjs from "dayjs";
import Field from "./Field";

export function CniField({ young, name, label, mode, onStartRequest, className = "", currentRequest, correctionRequest, onCorrectionRequestChange, onChange, blockUpload = false }) {
  const [opened, setOpened] = useState(false);
  const [hasValidRequest, setHasValidRequest] = useState(false);
  const [requestButtonClass, setRequestButtonClass] = useState("");
  const [mouseIn, setMouseIn] = useState(false);
  const [cniModalOpened, setCniModalOpened] = useState(false);

  useEffect(() => {
    setOpened(currentRequest === name);
  }, [currentRequest]);

  useEffect(() => {
    setHasValidRequest(correctionRequest ? correctionRequest.status !== "CANCELED" : false);
  }, [correctionRequest]);

  useEffect(() => {
    setRequestButtonClass(
      `flex items-center justify-center w-[32px] h-[32px] rounded-[100px] cursor-pointer group ${hasValidRequest ? "bg-[#F97316]" : "bg-[#FFEDD5] " + (mouseIn ? "visible" : "invisible")
      } hover:bg-[#F97316]`,
    );
  }, [mouseIn, hasValidRequest]);

  function startRequest() {
    setOpened(true);
    onStartRequest && onStartRequest(name);
  }

  const reasons = [
    { value: "UNREADABLE", label: "Pièce illisible (supprimer le fichier)" },
    { value: "MISSING_FRONT", label: "Recto à fournir" },
    { value: "MISSING_BACK", label: "Verso à fournir" },
    { value: "NOT_SUITABLE", label: "Pièce ne convenant pas... (supprimer le fichier)", defaultMessage: "Passeport ou carte nationale d'identité requis." },
    { value: "OTHER", label: "Autre (supprimer le fichier)" },
  ];

  function cniModalClose(changes) {
    setCniModalOpened(false);
    if (changes) {
      onChange && onChange();
    }
  }

  return (
    <>
      <div
        className={`p-[30px] bg-[#F9FAFB] rounded-[7px] mb-[15px] flex items-center justify-between ${className}`}
        onMouseEnter={() => setMouseIn(true)}
        onMouseLeave={() => setMouseIn(false)}>
        <div className="shrink-0">
          <Cni />
          <MiniTitle>Pièce d&apos;identité</MiniTitle>
        </div>
        <div className="flex items-center justify-end">
          {mode === "correction" && (
            <div className={requestButtonClass} onClick={startRequest}>
              <PencilAlt className={`w-[14px] h-[14px]  ${hasValidRequest ? "text-white" : "text-[#F97316]"} group-hover:text-white`} />
            </div>
          )}
          <MoreButton className="flex-[0_0_32px] ml-[8px]" onClick={() => setCniModalOpened(true)} />
        </div>
      </div>
      {correctionRequest && correctionRequest.status === "CORRECTED" && (
        <CorrectedRequest correctionRequest={correctionRequest} reasons={reasons} className="mt-[-6px] mb-[15px]" young={young} />
      )}
      {opened && (
        <CorrectionRequest
          name={name}
          label={label}
          correctionRequest={correctionRequest}
          onChangeRequest={onCorrectionRequestChange}
          reasons={reasons}
          messagePlaceholder="(Facultatif) Précisez les corrections à apporter ici"
        />
      )}
      {cniModalOpened && <CniModal young={young} onClose={cniModalClose} mode={mode} blockUpload={blockUpload} />}
    </>
  );
}

function CniModal({ young, onClose, mode, blockUpload }) {
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(null);
  const [error, setError] = useState(null);
  const [changes, setChanges] = useState(false);
  const [cniFiles, setCniFiles] = useState([]);
  const [filesToUpload, setFilesToUpload] = useState();
  const [date, setDate] = useState(new Date(young?.latestCNIFileExpirationDate) || null);
  const [category, setCategory] = useState(young?.latestCNIFileCategory || null);

  useEffect(() => {
    if (filesToUpload) young.filesToUpload = filesToUpload;
    if (category) young.latestCNIFileCategory = category;
    if (date) young.latestCNIFileExpirationDate = date;
  }, [filesToUpload, category, date])
  useEffect(() => {

  }, [category])

  useEffect(() => {
    console.log("File to upload is : ", young.filesToUpload);
    if (blockUpload) return setFilesToUpload(young.filesToUpload);
    if (young && young.files && young.files.cniFiles) {
      setCniFiles(young.files.cniFiles);
    } else {
      setCniFiles([]);
    }
  }, [young]);

  async function downloadCni(cniFile) {
    try {
      const result = await api.get("/young/" + young._id + "/documents/cniFiles/" + cniFile._id);
      const blob = new Blob([new Uint8Array(result.data.data)], { type: result.mimeType });
      download(blob, result.fileName);
    } catch (err) {
      toastr.error("Impossible de télécharger la pièce. Veuillez essayer dans quelques instants.");
    }
  }

  function deleteCni(file) {
    setConfirmDeleteModal({ file });
  }

  async function confirmDelete() {
    setError(null);
    const file = confirmDeleteModal.file;
    setConfirmDeleteModal(null);
    if (file) {
      console.log("Delete file: ", file);
      try {
        const res = await api.remove(`/young/${young._id}/documents/cniFiles/${file._id}`);
        if (res.ok) {
          setChanges(true);
          setCniFiles(res.data);
        } else {
          setError("Impossible de supprimer le fichier. Veuillez réessayer dans quelques instants.");
        }
      } catch (err) {
        console.log(err);
        setError("Impossible de supprimer le fichier. Veuillez réessayer dans quelques instants.");
      }
    }
  }

  async function upload(files) {
    for (const file of files) {
      if (file.size > 5000000)
        return setError({
          text: `Ce fichier ${files.name} est trop volumineux.`,
        });
    }
    if (!category || !date) return setError("Veuillez sélectionner une catégorie et une date d'expiration.");
    const res = await api.uploadFile(`/young/${young._id}/documents/cniFiles`, Array.from(files), {}, category, date);
    if (res.code === "FILE_CORRUPTED")
      return setError(
        "Le fichier semble corrompu. Pouvez-vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
      );
    if (!res.ok) {
      capture(res.code);
      setError("Une erreur s'est produite lors du téléversement de votre fichier.");
      return;
    }
    setError(null);
    setCniFiles(res.data);
    setChanges(true);
    setFilesToUpload(null);
  }

  const removeFileInscription = (file) => {
    console.log(file);
    setFilesToUpload(oldFiles => {
      const newArray = [];
      oldFiles.map((oldFile) => {
        if (oldFile !== file) {
          newArray.push(oldFile);
        }
      })
      return newArray;
    })
  }

  return (
    <Modal size="md" centered isOpen={true} toggle={() => onClose(changes)}>
      <div className="bg-white rounded-[8px]">
        <div className="p-[24px]">
          {cniFiles.length > 0 ? (
            cniFiles.map((file) => (
              <div key={file._id} className="flex items-center justify-between text-[12px] mt-[8px] border-b-[#E5E7EB] border-b-[1px] last:border-b-[0px] py-[12px]">
                <div className="text-right">{file.name}</div>
                <div className="flex items-center">
                  <DownloadButton className="ml-[8px] flex-[0_0_32px]" onClick={() => downloadCni(file)} />
                  <DeleteButton className="ml-[8px] flex-[0_0_32px]" onClick={() => deleteCni(file)} />
                </div>
              </div>
            ))
          ) : (
            <div className="text-[14px] text-[#6B7280] text-center">Aucune pièce d&apos;identité</div>
          )}
          {error && <div className="text-[#EF4444] text-[12px] leading-[1.4em] mt-[16px]">{error}</div>}
          {mode === "edition" && (
            <>
              <input
                type="file"
                multiple
                id="file-upload"
                name="file-upload"
                accept=".png, .jpg, .jpeg, .pdf"
                onChange={(e) => {
                  if (blockUpload) {
                    setFilesToUpload([...filesToUpload, ...e.target.files])
                    setChanges(true);
                  } else {
                    setFilesToUpload(e.target.files)
                  }
                }}
                className="hidden"
              />
              <div className="flex items-center justify-between mt-4">
                <label htmlFor="file-upload" className="flex text-xs space-x-4 items-center">
                  <AddButton className="" />
                  <div className="cursor-pointer text-gray-500 hover:text-gray-800">Ajouter un document</div>
                </label>
              </div>
              {filesToUpload && (
                <>
                  <div className="w-full flex space-x-2 justify-between mt-2 items-center">

                    {!blockUpload ?
                      <>
                        <div className="3/4">
                          {Array.from(filesToUpload).map((file) => (
                            <div key={file.name} className="text-[12px]0">
                              <div>{file.name}</div>
                            </div>
                          ))}
                        </div>
                        <div className="1/4">
                          <PlainButton onClick={() => upload(filesToUpload)} disabled={!category || !date}>
                            Téléverser
                          </PlainButton>
                        </div>
                      </>
                      :
                      <div className="flex flex-column w-100">
                        {Array.from(filesToUpload).map((file) => (
                          <div key={file.name} className="text-[12px] flex flex-row justify-between">
                            <div>{file.name}</div>
                            <div className="cursor-pointer" onClick={() => removeFileInscription(file)}>X</div>
                          </div>
                        ))}
                      </div>
                    }
                  </div>
                  <div className="flex mt-4 w-full space-x-2">
                    <div className="relative bg-white py-[9px] px-[13px] border-[#D1D5DB] border-[1px] rounded-[6px] w-1/2">
                      <label className="font-normal text-[12px] leading-[16px] text-[#6B7280]">Date d&apos;expiration</label>
                      <input
                        type="date"
                        value={dayjs(date).locale("fr").format("YYYY-MM-DD")}
                        onChange={(e) => setDate(e.target.value)}
                        onClick={(e) => {
                          if (e.target?.showPicker) e.target.showPicker();
                        }}
                        className="block bg-gray-50 w-[100%] cursor-pointer"
                      />
                    </div>
                    <Field
                      label="Catégorie"
                      value={category}
                      transformer={translate}
                      mode="edition"
                      type="select"
                      className="w-1/2"
                      options={["cniNew", "cniOld", "passport"].map((e) => ({ value: e, label: translate(e) }))}
                      onChange={(val) => setCategory(val)}
                    />
                  </div>
                </>
              )}
            </>
          )}
        </div>
        <div className="flex p-[24px] items-center justify-center">
          <BorderButton onClick={() => onClose(changes)}>Fermer</BorderButton>
        </div>
      </div>
      <ConfirmationModal
        isOpen={confirmDeleteModal}
        icon={<Warning className="text-[#D1D5DB] w-[36px] h-[36px]" />}
        title={"Supprimer la pièce"}
        message={"Voulez-vous vraiment supprimer ce fichier ? Cette action est irréversible."}
        confirmText="Confirmer la suppression"
        confirmMode="red"
        onCancel={() => setConfirmDeleteModal(null)}
        onConfirm={confirmDelete}
      />
    </Modal>
  );
}
