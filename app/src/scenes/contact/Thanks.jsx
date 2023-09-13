import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import { supportURL } from "@/config";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import React from "react";

export default function Thanks() {
  useDocumentTitle("Merci");

  return (
    <DSFRLayout title="Formulaire de contact">
      <DSFRContainer title="Merci de nous avoir contacté">
        <p className="leading-relaxed">Notre équipe met tout en oeuvre pour vous apporter une réponse dans les plus brefs délais.</p>
        <hr className="my-8" />
        <div className="flex flex-col md:flex-row gap-4 justify-end">
          <a href={supportURL} target="_blank" rel="noopener noreferrer" className="bg-blue-france-sun-113 text-white px-4 py-2 text-center hover:bg-blue-france-sun-113-hover">
            Consulter la base de connaissance
          </a>
          <a
            href="https://www.snu.gouv.fr/"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-france-sun-113 text-white px-4 py-2 text-center hover:bg-blue-france-sun-113-hover">
            Consulter le site du SNU
          </a>
        </div>
      </DSFRContainer>
    </DSFRLayout>
  );
}
