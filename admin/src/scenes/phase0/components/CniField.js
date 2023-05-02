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
import DatePickerList from "./DatePickerList";

export function CniField({
  young,
  name,
  label,
  mode,
  onStartRequest,
  className = "",
  currentRequest,
  correctionRequest,
  onCorrectionRequestChange,
  onChange,
  blockUpload = false,
  onInscriptionChange = null,
}) {
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
      `flex items-center justify-center w-[32px] h-[32px] rounded-[100px] cursor-pointer group ${
        hasValidRequest ? "bg-[#F97316]" : "bg-[#FFEDD5] " // + (mouseIn ? "visible" : "invisible")
      } hover:bg-[#F97316]`,
    );
  }, [mouseIn, hasValidRequest]);

  function startRequest() {
    setOpened(true);
    onStartRequest && onStartRequest(name);
  }

  const reasons = [
    { value: "UNREADABLE", label: "Pièce illisible (supprimer le(s) fichier(s))" },
    { value: "MISSING_FRONT", label: "Recto à fournir" },
    { value: "NOT_SUITABLE", label: "Pièce ne convenant pas... (supprimer le(s) fichier(s))", defaultMessage: "Passeport ou carte nationale d'identité requis." },
    { value: "OTHER", label: "Autre (supprimer le(s) fichier(s))" },
  ];

  if (young?.latestCNIFileCategory !== "PASSPORT") {
    reasons.push({ value: "MISSING_BACK", label: "Verso à fournir" });
  }

  function cniModalClose(changes) {
    setCniModalOpened(false);
    if (changes) {
      onInscriptionChange && onInscriptionChange(young);
      onChange && onChange();
    }
  }

  return (
    <>
      <div
        className={`mb-[15px] flex items-center justify-between rounded-[7px] bg-[#F9FAFB] p-[30px] ${className}`}
        onMouseEnter={() => setMouseIn(true)}
        onMouseLeave={() => setMouseIn(false)}>
        <div className="shrink-0">
          <Cni />
          <MiniTitle>Pièce d&apos;identité</MiniTitle>
        </div>
        <div className="flex items-center justify-end">
          {mode === "correction" && (
            <div className={requestButtonClass} onClick={startRequest}>
              <PencilAlt className={`h-[14px] w-[14px]  ${hasValidRequest ? "text-white" : "text-[#F97316]"} group-hover:text-white`} />
            </div>
          )}
          <MoreButton className="ml-[8px] flex-[0_0_32px]" onClick={() => setCniModalOpened(true)} />
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
          reasons={young.latestCNIFileCategory ? reasons : reasons.filter(({ value }) => !["MISSING_FRONT", "MISSING_BACK"].includes(value))}
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
  const [date, setDate] = useState(young?.latestCNIFileExpirationDate ? new Date(young?.latestCNIFileExpirationDate) : new Date());
  const [category, setCategory] = useState(young?.latestCNIFileCategory || null);

  useEffect(() => {
    if (filesToUpload) young.filesToUpload = filesToUpload;
    if (category !== null) young.latestCNIFileCategory = category;
    if (date !== null) young.latestCNIFileExpirationDate = date;
    setChanges(true);
  }, [filesToUpload, category, date]);

  useEffect(() => {
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
      if (file.size > 5000000) return setError(`Le fichier ${file.name} est trop volumineux.`);
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
    setFilesToUpload((oldFiles) => {
      const newArray = [];
      oldFiles.map((oldFile) => {
        if (oldFile !== file) {
          newArray.push(oldFile);
        }
      });
      return newArray;
    });
  };

  return (
    <Modal size="md" centered isOpen={true} toggle={() => onClose(changes)}>
      <div className="rounded-[8px] bg-white">
        <div className="p-[24px]">
          {cniFiles.length > 0 || (blockUpload && filesToUpload?.length > 0) ? (
            cniFiles.map((file) => (
              <div key={file._id} className="mt-[8px] flex items-center justify-between border-b-[1px] border-b-[#E5E7EB] py-[12px] text-[12px] last:border-b-[0px]">
                <div className="text-right">{file.name}</div>
                <div className="flex items-center">
                  <DownloadButton className="ml-[8px] flex-[0_0_32px]" onClick={() => downloadCni(file)} />
                  <DeleteButton className="ml-[8px] flex-[0_0_32px]" onClick={() => deleteCni(file)} />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-[14px] text-[#6B7280]">Aucune pièce d&apos;identité</div>
          )}
          {error && <div className="mt-[16px] text-[12px] leading-[1.4em] text-[#EF4444]">{error}</div>}
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
                    const array = [];
                    let error = "";
                    for (const file of e.target.files) {
                      if (file.size > 5000000) {
                        error += `Le fichier ${file.name} est trop volumineux.`;
                      } else {
                        array.push(file);
                      }
                    }
                    setError(error);
                    console.log(array);
                    setFilesToUpload([...filesToUpload, ...array]);
                  } else {
                    setFilesToUpload(e.target.files);
                  }
                }}
                className="hidden"
              />
              <div className="mt-4 flex items-center justify-between">
                <label htmlFor="file-upload" className="flex items-center space-x-4 text-xs">
                  <AddButton className="" />
                  <div className="cursor-pointer text-gray-500 hover:text-gray-800">Ajouter un document</div>
                </label>
              </div>
              {filesToUpload && (
                <>
                  <div className="mt-2 flex w-full items-center justify-between space-x-2">
                    {!blockUpload ? (
                      <>
                        <div className="3/4">
                          {Array.from(filesToUpload).map((file) => (
                            <div key={file.name} className="text-[12px]">
                              {file.name}
                            </div>
                          ))}
                        </div>
                        <div className="1/4">
                          <PlainButton onClick={() => upload(filesToUpload)} disabled={!category || !date}>
                            Téléverser
                          </PlainButton>
                        </div>
                      </>
                    ) : (
                      <div className="flex-column w-100 flex">
                        {Array.from(filesToUpload).map((file) => (
                          <div key={file.name} className="flex flex-row justify-between text-[12px]">
                            <div>{file.name}</div>
                            <div className="cursor-pointer" onClick={() => removeFileInscription(file)}>
                              X
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 flex w-full space-x-2">
                    <div className="relative w-1/2 rounded-[6px] border-[1px] border-[#D1D5DB] bg-white py-[9px] px-[13px]">
                      <label className="text-[12px] font-normal leading-[16px] text-[#6B7280]">Date d&apos;expiration</label>
                      <DatePickerList fromEdition={false} value={new Date(date)} onChange={(val) => setDate(val)} />
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
        <div className="flex items-center justify-center p-[24px]">
          <BorderButton onClick={() => onClose(changes)}>Fermer</BorderButton>
        </div>
      </div>
      <ConfirmationModal
        isOpen={confirmDeleteModal}
        icon={<Warning className="h-[36px] w-[36px] text-[#D1D5DB]" />}
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
