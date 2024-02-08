import React, { useState, useCallback, useRef } from "react";
import Bin from "../assets/icons/Bin";

const FILES_ACCEPTED = {
  word: [".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  excel: [".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  pdf: [".pdf"],
  jpeg: [".jpg", ".jpeg"],
  png: [".png"],
};

const MAX_FILE_SIZE = 5000000;

const FileUpload = ({ className, files = [], addFiles, deleteFile, filesAccepted = ["jpeg", "png", "pdf"], disabled = false }) => {
  const inputRef = useRef(null);
  const accept = Object.keys(FILES_ACCEPTED).reduce((previous, current) => {
    if (filesAccepted.includes(current)) {
      return `${previous}${previous ? ", " : ""}${FILES_ACCEPTED[current].join(", ")}`;
    }
    return previous;
  }, "");

  return (
    <div className={className}>
      <label className="w-full text-[14px] font-semibold text-[#374151]">
        Ajouter un fichier
        <div className="mt-1 text-sm text-gray-500">Taille maximale : 5 Mo. Formats supportés : jpg, png, pdf, docx, xlsx. Plusieurs fichiers possibles.</div>
        <input
          ref={inputRef}
          disabled={disabled}
          type="file"
          multiple
          id="file-upload"
          name="file-upload"
          accept={accept}
          onChange={(e) => {
            addFiles(e.target.files);
          }}
          className="hidden"
        />
      </label>
      <div className={`flex flex-col md:flex-row ${files.length === 0 && "flex-row"} mt-4 w-full`}>
        <div>
          <label htmlFor="file-upload" className={`cursor-pointer ${disabled && "cursor-not-allowed"} rounded bg-[#EEEEEE] py-2 px-3 text-sm text-gray-600`}>
            Parcourir...
          </label>
        </div>
        <div className="mb-2 md:ml-4">
          {files.length !== 0 ? (
            files.map((e, i) => (
              <div key={i} className="mb-2 flex">
                <p className="w-3/5 overflow-hidden truncate text-sm text-gray-800 md:w-1/3 lg:w-1/2 xl:w-3/5" key={e.name}>
                  {e.name}
                </p>
                <div
                  onClick={() => {
                    if (!disabled) {
                      deleteFile(i);
                      inputRef.current.value = "";
                    }
                  }}
                  className={`cursor-pointer ${disabled && "cursor-not-allowed"} ml-2 flex w-1/3 text-blue-800`}>
                  <div className="mt-1">
                    <Bin />
                  </div>
                  <p className="ml-2 text-sm font-medium">Supprimer</p>
                </div>
              </div>
            ))
          ) : (
            <div className="ml-3 mt-2 text-sm text-gray-800">Aucun fichier sélectionné.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export const useFileUpload = () => {
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");

  const addFiles = useCallback(
    (newFiles) => {
      const validatedFiles = [...newFiles].filter((file) => {
        const isVoluminous = file.size > MAX_FILE_SIZE;
        if (isVoluminous) {
          setError(`Ce fichier ${file.name} est trop volumineux.`);
        }
        return !isVoluminous;
      });
      setFiles([...files, ...validatedFiles]);
    },
    [files],
  );

  const deleteFile = useCallback(
    (index) => {
      setFiles(files.filter((_file, i) => i !== index));
    },
    [files],
  );

  const resetFiles = useCallback(() => {
    setFiles([]);
  }, [files]);

  return { files, addFiles, deleteFile, resetFiles, error };
};

export default FileUpload;
