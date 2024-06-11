import React, { useState } from "react";
import { convertImage, resizeImage } from "../../../services/file.service";

export default function FileImport({ id, file, setFile, setError = () => {}, onChange }) {
  const [fileName, setFileName] = useState("");
  const [buttonText, setButtonText] = useState("Importer un fichier");

  async function handleChange(e) {
    if (!e.target.files.length) return;

    let image = e.target.files[0];

    if (!["application/pdf", "image/jpeg", "image/png", "image/jpg", "image.heif", "image.heic"].includes(image.type)) {
      setError({ message: "Format de fichier non supporté." });
      return;
    }

    try {
      if (["image/heif", "image.heic"].includes(image.type)) {
        image = await convertImage(image, "PNG");
      }
      if (image.size > 1_000_000) {
        image = await resizeImage(image);
      }
      setFile(image);
      setFileName(image.name);
      setButtonText("Remplacer le fichier");
      setError({});
      onChange && onChange();
    } catch (error) {
      setError({ message: error.message });
      console.error("Error processing the file:", error);
    }
  }

  return (
    <>
      <div className="my-4 text-sm text-gray-500">Formats supportés : jpg, png, pdf. Pour les PDF, taille maximum : 5 Mo.</div>
      <input type="file" id={id} name={id} accept=".png, .jpg, .jpeg, .pdf, .heif, .heic" onChange={handleChange} className="hidden" />
      {fileName && <p className="my-2 text-sm text-gray-700">{fileName}</p>}
      <div className="my-4 flex w-full">
        <div>
          <label htmlFor={id} className="cursor-pointer rounded bg-[#EEEEEE] py-2 px-3 text-sm text-gray-600">
            {buttonText}
          </label>
        </div>
      </div>
    </>
  );
}
