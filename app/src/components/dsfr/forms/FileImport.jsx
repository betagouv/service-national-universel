import React from "react";
import { convertImage, resizeImage } from "../../../services/file.service";

export default function FileImport({ id, file, setFile, setError = () => {}, onChange }) {
  async function handleChange(e) {
    if (!e.target.files.length) return;

    let image = e.target.files[0];
    console.log("Selected file:", image);

    if (!["application/pdf", "image/jpeg", "image/png", "image/jpg", "image/heif", "image/heic"].includes(image.type)) {
      setError({ message: "Format de fichier non supporté." });
      return;
    }

    try {
      if (["image/heif", "image/heic"].includes(image.type)) {
        console.log("Converting HEIC/HEIF to PNG");
        image = await convertImage(image, "PNG");
      }
      if (image.size > 1_000_000) {
        console.log("Resizing image");
        image = await resizeImage(image);
      }
      console.log("Final image:", image);
      setFile(image);
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
      <div className="my-4 flex w-full">
        <div>
          <label htmlFor={id} className="cursor-pointer rounded bg-[#EEEEEE] py-2 px-3 text-sm text-gray-600">Importer un fichier</label>
        </div>
      </div>
    </>
  );
}
