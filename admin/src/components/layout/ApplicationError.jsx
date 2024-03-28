import React from "react";

import { Button } from "@snu/ds/admin";

import useEnvironment from "@/hooks/useEnvironment";

export default function ApplicationError({ error, componentStack }) {
  const { isDevelopment } = useEnvironment();
  return (
    <div className="flex flex-col items-center justify-center p-20">
      <div className="text-center mb-3">Une erreur s’est produite lors du chargement de cette page. Actualisez la page pour la recharger...</div>
      <Button title="Actualiser" type="secondary" onClick={() => window.location.reload()} />
      <div className={`text-red-600 ${isDevelopment ? "block" : "hidden"}`}>
        <div>You have encountered an error</div>
        <div>{error.toString()}</div>
        <div className="whitespace-pre-wrap none">{componentStack}</div>
      </div>
    </div>
  );
}
