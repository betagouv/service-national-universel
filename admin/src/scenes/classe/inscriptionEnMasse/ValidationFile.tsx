import React from "react";
import { HiOutlineExclamation } from "react-icons/hi";

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
        <h2 className="text-xl font-semibold text-gray-900">Votre fichier semble comporter quelques erreurs...</h2>
        <p className="text-lg mt-4 font-medium">{totalErrors} erreurs identifiées</p>
      </div>

      <div className="mt-4">
        {errors.length > 0 ? (
          <div className="border border-gray-200 rounded-md">
            {errors.map((error, index) => (
              <div key={index} className={index < errors.length - 1 ? "border-b border-gray-200 px-4 py-3" : "px-4 py-3"}>
                <h3 className="font-semibold">{error.category}</h3>
                <div className="mt-1">
                  {error.details.map((detail, detailIndex) => (
                    <p key={detailIndex} className="my-1">
                      <span className="text-red-500 font-medium">Ligne {detail.line} • </span>
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

      <div className="text-center mt-6">
        <button
          onClick={onRetry}
          className="inline-flex justify-center items-center rounded-md px-4 py-2 bg-blue-600 text-white text-base font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          Téléverser le fichier corrigé
        </button>
      </div>
    </div>
  );
};
