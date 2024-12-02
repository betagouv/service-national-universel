import React, { useRef } from "react";
import Button from "../ui/Button";
import { HiOutlineDocumentAdd } from "react-icons/hi";

interface InputFileProps {
  accept: string;
  loading?: boolean;
  error?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
export default function InputFile({
  accept,
  loading,
  error,
  onChange,
}: InputFileProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  function handleUploadlFile(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    if (fileInput && fileInput.current) {
      fileInput.current.click();
    }
  }

  return (
    <>
      <>
        <Button
          disabled={loading}
          onClick={handleUploadlFile}
          className="cursor-pointer text-center mx-auto text-blue-600"
          leftIcon={<HiOutlineDocumentAdd className="mt-0.5 mr-2" size={20} />}
          title={loading ? "Chargement..." : "Téléversez votre fichier"}
        ></Button>
        <input
          type="file"
          accept={accept}
          ref={fileInput}
          onChange={onChange}
          className="hidden"
        />
        {error && (
          <div className="mt-8 text-center text-sm font-bold text-red-900">
            {error}
          </div>
        )}
      </>
    </>
  );
}
