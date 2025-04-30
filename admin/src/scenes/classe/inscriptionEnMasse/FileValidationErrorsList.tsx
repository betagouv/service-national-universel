import React from "react";
import { HiOutlineExclamation, HiOutlineUpload } from "react-icons/hi";
import { Button } from "@snu/ds/admin";
import cx from "classnames";
export type ImportEnMasseError = {
  category: string;
  details: Array<{
    line: number;
    message: string;
  }>;
};

export type ValidationFileProps = {
  errorMessage: string | ImportEnMasseError[];
  onRetry: () => void;
};

export const ValidationFile = ({ errorMessage, onRetry }: ValidationFileProps) => {
  const errors: ImportEnMasseError[] = typeof errorMessage === "string" ? JSON.parse(errorMessage) : Array.isArray(errorMessage) ? errorMessage : [];

  const totalErrors = errors.reduce((count, category) => count + category.details.length, 0);

  return (
    <div>
      <div className="flex flex-col items-center text-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <HiOutlineExclamation className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Votre fichier semble comporter quelques erreurs...</h2>
        <p className="text-lg mt-4">{totalErrors} erreurs identifiées</p>
      </div>

      <div className="mt-4">
        {errors.length > 0 ? (
          <div className="border !border-red-500 rounded-md">
            {errors.map((error, index) => (
              <div key={index} className={cx("border-red-500 px-4 py-3", { "border-t": index })}>
                <h3 className="text-sm leading-5 font-bold gray-900">{error.category}</h3>
                <div className="mt-1">
                  {error.details.map((detail, detailIndex) => (
                    <p key={detailIndex} className="text-sm leading-5 font-normal my-1">
                      <span className="text-red-600">Ligne {detail.line || 1} • </span>
                      {detail.message}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-600">Aucune erreur à afficher</p>
        )}
      </div>

      <div className="flex justify-center mt-6">
        <Button onClick={onRetry} leftIcon={<HiOutlineUpload className="w-5 h-5" />} title="Téléverser le fichier corrigé" />
      </div>
    </div>
  );
};
