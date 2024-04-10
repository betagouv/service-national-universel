import React from "react";

import { adminURL } from "@/config";
import useEnvironment from "@/hooks/useEnvironment";

export default function GenericError({ title = "Une erreur s’est produite !", details = "erreur inconnue", icon, error, componentStack }) {
  const { isDevelopment } = useEnvironment();
  return (
    <div className="flex flex-col items-center justify-center px-32 min-h-screen gap-2 text-ds-gray-900">
      {icon}
      <div className="font-bold text-2xl">Ooops ...</div>
      <div className="text-xl">{title}</div>
      <div className="text-ds-gray-500">({details})</div>
      <div className="text-center">
        Toutes nos excuses pour la gêne occasionnée.{" "}
        <a
          href=""
          className="underline"
          onClick={(e) => {
            e.preventDefault();
            window.location.reload();
          }}>
          Actualisez cette page
        </a>{" "}
        ou revenez à l’accueil.
        <br />
        Si le problème persiste n’hésitezpas à{" "}
        <a href={`${adminURL}/besoin-d-aide?from=${window.location.pathname}`} className="underline">
          nous contacter
        </a>
        .
      </div>
      {error && (
        <div className={`text-red-600 ${isDevelopment ? "block" : "hidden"}`}>
          <div>You have encountered an error</div>
          <div>{error?.toString()}</div>
          <div className="whitespace-pre-wrap none">{componentStack}</div>
        </div>
      )}
    </div>
  );
}
