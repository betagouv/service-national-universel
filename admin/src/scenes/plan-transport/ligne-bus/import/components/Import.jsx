import React, { useRef, useState } from "react";
import { PlainButton } from "../../../components/Buttons";
import ExcelColor from "../../components/Icons/ExcelColor.png";
import ReactLoading from "react-loading";
import { HiOutlineChevronDown } from "react-icons/hi";
import { GrCircleInformation } from "react-icons/gr";
import { MIME_TYPES, PDT_IMPORT_ERRORS_TRANSLATION } from "snu-lib";
import api from "../../../../../services/api";
import { capture } from "../../../../../sentry";

const FILE_SIZE_LIMIT = 5 * 1024 * 1024;

export default function Import({ cohort, onFileVerified }) {
  const [isLoading, setIsLoading] = useState(false);
  const [importErrors, setImportErrors] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [importedFileName, setImportedFileName] = useState(null);
  const fileInput = useRef(null);

  function importFile(e) {
    e.preventDefault();
    setUploadError(null);
    if (fileInput && fileInput.current) {
      fileInput.current.click();
    }
  }

  async function upload(e) {
    if (!e?.target?.files?.length) return;
    const file = e.target.files[0];
    setUploadError(null);
    setImportedFileName(file.name);
    if (file.type !== MIME_TYPES.EXCEL) {
      setUploadError("Le fichier doit être au format Excel.");
      return;
    }
    if (file.size > FILE_SIZE_LIMIT) {
      setUploadError("Votre fichier dépasse la limite de 5Mo.");
      return;
    }

    setIsUploading(true);
    setImportErrors(null);
    try {
      const res = await api.uploadFile(`/plan-de-transport/import/${cohort}`, [file]);
      if (res.code === "FILE_CORRUPTED") {
        setUploadError("Le fichier semble corrompu. Pouvez-vous changer le format ou regénérer votre fichier ? Si vous rencontrez toujours le problème, contactez le support.");
      } else if (!res.ok) {
        if (res.code === "INVALID_BODY" && res.errors) {
          setImportErrors(res.errors);
        } else {
          capture(res.code);
          setUploadError("Une erreur s'est produite lors du téléversement de votre fichier.");
        }
      } else {
        onFileVerified && onFileVerified(res.data);
      }
    } catch (err) {
      setUploadError("Une erreur est survenue. Nous n'avons pu enregistrer le fichier. Veuillez réessayer dans quelques instants.");
    }
    setIsUploading(false);
  }

  function getErrorsCount() {
    let count = 0;
    if (importErrors) {
      for (const errors of Object.values(importErrors)) {
        count += Object.keys(errors).length;
      }
    }
    return count + (count > 1 ? " erreurs détectées" : " erreur détectée");
  }

  return importErrors ? (
    <>
      <div className="mt-8 flex w-full flex-col gap-6 rounded-xl bg-white px-8 pt-12 pb-24">
        <div className="pb-4 text-center text-xl font-medium leading-7 text-gray-900">Import du fichier</div>
        <div className="flex flex-col items-center justify-center gap-8">
          <div className="flex items-center gap-4">
            <div className="flex items-center">
              <img src={ExcelColor} alt="Excel" className="w-[56px]" />
              <div className="flex flex-col">
                <div className="text-sm leading-5 text-gray-900">{importedFileName}</div>
                <div className="text-xs leading-5 text-gray-500">{getErrorsCount()}</div>
              </div>
            </div>
            <button
              className="flex items-center gap-3 rounded-md border !border-blue-600 bg-white py-2 px-4 text-sm font-medium text-blue-700 hover:shadow"
              onClick={() => {
                setIsLoading(false);
                setImportErrors(false);
              }}>
              Importer un nouveau fichier
            </button>
          </div>
          {Object.entries(importErrors)
            .filter(([, errors]) => errors?.length)
            .map(([col, errors]) => (
              <ErrorBlock column={col} errors={errors} key={col} />
            ))}
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <PlainButton className="w-52" disabled>
          Suivant
        </PlainButton>
      </div>
    </>
  ) : (
    <>
      <div className="mt-8 flex w-full flex-col items-center justify-center gap-6 rounded-xl bg-white px-8 pt-12 pb-24">
        <div className="pb-4 text-center text-xl font-medium leading-7 text-gray-900">Import du fichier</div>
        <div className="flex h-[218px] w-[641px] flex-col items-center justify-center gap-2 rounded-lg border-[1px] border-dashed border-gray-300">
          <img src={ExcelColor} alt="Excel" className="w-[71px]" />
          {!isLoading && !isUploading ? (
            <>
              <div onClick={importFile} className="cursor-pointer text-center text-sm font-medium leading-5 text-blue-600 hover:underline">
                Téléversez votre fichier
              </div>
              <div className="text-xs font-normal leading-4 text-gray-500">XLSX jusqu’à 5Mo</div>
              <input type="file" accept={MIME_TYPES.EXCEL} ref={fileInput} onChange={upload} className="hidden" />
              {uploadError && <div className="mt-8 text-center text-sm font-bold text-red-900">{uploadError}</div>}
            </>
          ) : (
            <ReactLoading className="mt-2" type="spin" color="#2563EB" width={"40px"} height={"40px"} />
          )}
        </div>
      </div>
    </>
  );
}

const ErrorBlock = ({ column, errors }) => {
  const [open, setOpen] = useState(false);

  const errorList = errors.map((e) => ({
    line: e.line,
    error: getErrorText(e.error, e.extra),
    tooltip: getErrorTooltip(e.error),
  }));

  const colName = column;

  return (
    <div className="flex w-[700px] flex-col">
      <button className={`flex items-center rounded-t-lg bg-[#EA5946] ${open ? "" : "rounded-b-lg"} h-[56px] px-4`} onClick={() => setOpen(!open)}>
        <div className="flex grow items-center justify-between gap-10">
          <div className="text-sm font-bold leading-5 text-white">
            {errorList.length + (errorList.length > 1 ? " erreurs" : " erreur")} - {colName}
          </div>
          <div className="text-xs font-normal leading-5 text-white">Colonne {column}</div>
        </div>
        <HiOutlineChevronDown className={`ml-2 h-5 w-5 text-white ${open ? "rotate-180 transform" : ""}`} />
      </button>

      <div className={`${open ? "block" : "hidden "} w-full rounded-b-lg border-b-[1px] border-r-[1px] border-l-[1px] border-gray-200`}>
        {errorList.map((item, index) => (
          <React.Fragment key={"item-" + item.line}>
            {index !== 0 && <hr className="border-gray-200" />}
            <div className="flex w-full items-center px-4 py-2">
              <div className="text-sm font-medium leading-5 text-gray-800">Ligne {item.line}</div>
              <div className="flex w-1/4 grow items-center justify-end gap-4">
                <div className="text-sm font-normal leading-5 text-gray-800">{item.error}</div>
                <div className="group relative">
                  <GrCircleInformation data-tip data-for="info" className="h-3 w-3 cursor-pointer text-gray-500" />
                  <div className="absolute bottom-[calc(100%+5px)] left-[50%] z-10 hidden min-w-[300px] translate-x-[-50%] rounded-lg bg-gray-200 px-2 py-1 text-center text-black shadow-sm group-hover:block">
                    <div className="absolute left-[50%] bottom-[-5px] h-[10px] w-[10px] translate-x-[-50%] rotate-45 bg-gray-200 shadow-sm"></div>
                    {item.tooltip}
                  </div>
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

function getErrorText(error, extra) {
  const err = PDT_IMPORT_ERRORS_TRANSLATION[error];
  if (err) {
    return err.text.replace("%s", extra);
  } else {
    return error;
  }
}

function getErrorTooltip(error) {
  const err = PDT_IMPORT_ERRORS_TRANSLATION[error];
  if (err) {
    return err.tooltip;
  } else {
    return error;
  }
}
