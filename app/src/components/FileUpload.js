import React, { useState, useCallback } from "react";
import Bin from "../assets/icons/Bin";

const FILES_ACCEPTED = {
  word: [".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  excel: [".xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
  pdf: [".pdf"],
  jpeg: [".jpg", ".jpeg"],
  png: [".png"],
};

const MAX_FILE_SIZE = 5000000;

const FileUpload = ({ className, files = [], addFiles, deleteFile, filesAccepted = ["jpeg", "png", "pdf"] }) => {
  const accept = Object.keys(FILES_ACCEPTED).reduce((previous, current) => {
    if (filesAccepted.includes(current)) {
      return `${previous}${previous ? ", " : ""}${FILES_ACCEPTED[current].join(", ")}`;
    }
    return previous;
  }, "");

  return (
    <div className={className}>
      <label className="text-[#374151] font-semibold text-[14px]">Ajouter un fichier</label>
      <div className="text-gray-500 text-sm mt-1">Taille maximale : 5 Mo. Formats supportés : jpg, png, pdf, docx, xlsx. Plusieurs fichiers possibles.</div>
      <input
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
      <div className={`flex md:flex-row flex-col ${files.length === 0 && "flex-row"} w-full mt-4`}>
        <div>
          <label htmlFor="file-upload" className="cursor-pointer bg-[#EEEEEE] text-sm py-2 px-3 rounded text-gray-600">
            Parcourir...
          </label>
        </div>
        <div className="md:ml-4 mb-2">
          {files.length !== 0 ? (
            files.map((e, i) => (
              <div key={i} className="flex mb-2">
                <p className="text-gray-800 text-sm w-3/5 md:w-1/3 lg:w-1/2 xl:w-3/5 truncate overflow-hidden" key={e.name}>
                  {e.name}
                </p>
                <div onClick={() => deleteFile(i)} className="cursor-pointer text-blue-800 flex ml-2 w-1/3">
                  <div className="mt-1">
                    <Bin />
                  </div>
                  <p className="text-sm font-medium ml-2">Supprimer</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-gray-800 text-sm ml-3 mt-2">Aucun fichier sélectionné.</div>
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
