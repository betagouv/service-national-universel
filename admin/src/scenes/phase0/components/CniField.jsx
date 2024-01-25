import UploadedFileIcon from "@/assets/icons/UploadedFileIcon";
import { AddButton, DeleteButton, MiniTitle, MoreButton } from "./commons";
import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { translate } from "snu-lib";
import { toastr } from "react-redux-toastr";
import CorrectionRequest from "./CorrectionRequest";
import PencilAlt from "@/assets/icons/PencilAlt";
import CorrectedRequest from "./CorrectedRequest";
import { Modal } from "reactstrap";
import { BorderButton, PlainButton } from "./Buttons";
import ConfirmationModal from "./ConfirmationModal";
import Warning from "@/assets/icons/Warning";
import { capture } from "@/sentry";
import Field from "./Field";
import DatePickerInput from "@/components/ui/forms/dateForm/DatePickerInput";
import { resizeImage } from "../../../services/file.service";
import Eye from "../../../assets/icons/Eye";
import { Spinner } from "reactstrap";

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

  function cniModalClose(changes, value) {
    setCniModalOpened(false);
    if (changes) {
      onInscriptionChange && onInscriptionChange(young);
      onChange && onChange("files", { cniFiles: value });
    }
  }

  return (
    <>
      <div
        className={`mb-[15px] flex items-center justify-between rounded-[7px] bg-[#F9FAFB] p-[30px] ${className}`}
        onMouseEnter={() => setMouseIn(true)}
        onMouseLeave={() => setMouseIn(false)}>
        <div className="shrink-0">
          <UploadedFileIcon />
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (filesToUpload) young.filesToUpload = filesToUpload;
    if (category !== null) young.latestCNIFileCategory = category;
    if (date !== null) young.latestCNIFileExpirationDate = date;
    setChanges(true);
  }, [filesToUpload, category, date]);

  useEffect(() => {
    (async () => {
      if (blockUpload) return setFilesToUpload(young.filesToUpload);
      setCniFiles(young?.files?.cniFiles || []);
    })();
  }, [young]);

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
    setLoading(true);
    if (!category || !date) return setError("Veuillez sélectionner une catégorie et une date d'expiration.");

    for (const file of files) {
      const res = await api.uploadFiles(`/young/${young._id}/documents/cniFiles`, file, { category, expirationDate: date });

      if (res.code === "FILE_CORRUPTED") {
        setError(
          "Le fichier semble corrompu. Pouvez-vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support inscription@snu.gouv.fr",
        );
        setLoading(false);
        return;
      }

      if (!res.ok) {
        capture(res.code);
        setError("Une erreur s'est produite lors du téléversement de votre fichier.");
        setLoading(false);
        return;
      }
      setCniFiles(res.data);
      setChanges(true);
    }
    setError(null);
    setFilesToUpload(null);
    setLoading(false);
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

  const handleChange = async (e) => {
    const array = [];
    let error = "";

    for (let file of e.target.files) {
      file = await resizeImage(file);
      if (file.size > 1000000) {
        error += `Le fichier ${file.name} est trop volumineux.`;
      } else {
        array.push(file);
      }
    }

    setError(error);
    setFilesToUpload(array);
  };

  const handlePreview = async (file) => {
    try {
      setLoading(true);
      const response = await api.get(`/young/${young._id}/documents/cniFiles/${file._id}`);
      const arrayBuffer = new Uint8Array(response.data.data).buffer;
      const blob = new Blob([arrayBuffer], { type: response.mimeType });
      const imageUrl = URL.createObjectURL(blob);
      setLoading(false);
      window.open(imageUrl, "_blank");
    } catch (error) {
      console.error("Error fetching preview:", error);
      setLoading(false);
    }
  };

  return (
    <Modal size="md" centered isOpen={true} toggle={() => onClose(changes, cniFiles)}>
      <div className="rounded-[8px] bg-white">
        <div className="p-[24px]">
          {cniFiles.length > 0 || (blockUpload && filesToUpload?.length > 0) ? (
            cniFiles.map((file) => (
              <div key={file._id} className="border-b-[1px] border-b-[#E5E7EB] py-[12px]">
                <div className="mt-[8px] flex items-center justify-between text-[12px] last:border-b-[0px]">
                  <div className="">
                    <p>{file.name}</p>
                    <p className="truncate text-xs text-gray-500">
                      {translate(file.category)}
                      {file.side && ` - ${file.side}`}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button
                      className={`group flex h-[32px] w-[32px] cursor-pointer items-center justify-center rounded-[100px] bg-[#2563EB] hover:bg-[#DBEAFE]`}
                      onClick={() => {
                        handlePreview(file);
                      }}>
                      {loading ? (
                        <Spinner size="sm" key={"loading"} style={{ borderWidth: "0.1em", color: "white" }} />
                      ) : (
                        <Eye className="h-[14px] w-[14px] text-[#DBEAFE] group-hover:text-[#2563EB]" />
                      )}
                    </button>

                    <DeleteButton className="ml-[8px] flex-[0_0_32px]" onClick={() => deleteCni(file)} />
                  </div>
                </div>
              </div>
            ))
          ) : young?.latestCNIFileCategory === "deleted" ? (
            <div className="text-center text-[14px] text-[#6B7280]">Pour des raisons de sécurité, les documents ont été supprimés.</div>
          ) : (
            <div className="text-center text-[14px] text-[#6B7280]">Aucune pièce d&apos;identité.</div>
          )}
          {error && <div className="mt-[16px] text-[12px] leading-[1.4em] text-[#EF4444]">{error}</div>}
          {mode === "edition" && (
            <>
              <input type="file" multiple id="file-upload" name="file-upload" accept=".png, .jpg, .jpeg, .pdf" onChange={handleChange} className="hidden" />
              <div className="mt-4 flex items-center justify-between">
                <label htmlFor="file-upload" className="flex items-center space-x-4 text-xs cursor-pointer text-gray-500 hover:text-gray-800">
                  <AddButton />
                  <div>
                    <p>Ajouter un document</p>
                    <p>Formats supportés : jpg, png, pdf. Pour les PDF, taille maximum : 5 Mo.</p>
                  </div>
                </label>
              </div>
              {filesToUpload?.length > 0 && !error && (
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
                          <PlainButton onClick={() => upload(filesToUpload)} disabled={!category || !date || loading}>
                            {loading ? "Chargement" : "Téléverser"}
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
                  <div className="mt-4 w-full space-y-2">
                    <DatePickerInput label="Date d'expiration" value={date} onChange={(date) => setDate(date)} />
                    <Field
                      label="Catégorie"
                      value={category}
                      transformer={translate}
                      mode="edition"
                      type="select"
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
          {blockUpload ? (
            !category && filesToUpload?.length > 0 ? (
              <PlainButton disabled={true}>Selectionnez une catégorie pour ajouter ce document</PlainButton>
            ) : filesToUpload?.length > 0 ? (
              <BorderButton onClick={() => onClose(changes, cniFiles, toastr.success("Ce document a bien été ajouté."))}>Ajouter le document</BorderButton>
            ) : (
              <BorderButton onClick={() => onClose(changes, cniFiles)}>Fermer</BorderButton>
            )
          ) : (
            <BorderButton onClick={() => onClose(changes, cniFiles)}>Fermer</BorderButton>
          )}
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
