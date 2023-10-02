import React from "react";
import { supportURL } from "@/config";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";

export default function TokenInvalide() {
  return (
    <DSFRContainer title="Vous n'avez pas les droits d'accès à cette page">
      <p className="mb-8">
        Besoin d&apos;aide&nbsp;?{" "}
        <a rel="noreferrer" href={supportURL} target="_blank" className="scale-105 cursor-pointer hover:underline">
          Cliquez ici
        </a>
      </p>
    </DSFRContainer>
  );
}
