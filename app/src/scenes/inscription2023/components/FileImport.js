import React from "react";
import { resizeImage } from "../../../services/file.service";

export default function FileImport({ id, file, setFile, setError, onChange }) {
  async function handleChange(e) {
    const image = await resizeImage(e.target.files[0]);
    setFile(image);
    setError({});
    onChange && onChange();
  }

  return (
    <>
      <div className="my-4 text-sm text-gray-500">Formats supportés : jpg, png, pdf. Pour les PDF, taille maximum  : 1 Mo.</div>
      <input type="file" id={id} name={id} accept=".png, .jpg, .jpeg, .pdf" onChange={handleChange} className="hidden" />
      <div className="my-4 flex w-full">
        <div>
          <label htmlFor={id} className="cursor-pointer rounded bg-[#EEEEEE] py-2 px-3 text-sm text-gray-600">
            Parcourir...
          </label>
        </div>
        {file ? <p className="ml-4 mt-2 text-sm text-gray-800">{file.name}</p> : <p className="ml-4 mt-2 text-sm text-gray-800">Aucun fichier sélectionné.</p>}
      </div>
    </>
  );
}
