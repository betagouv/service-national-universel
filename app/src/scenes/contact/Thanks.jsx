import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import { knowledgebaseURL } from "@/config";
import useDocumentTitle from "@/hooks/useDocumentTitle";
import React from "react";

export default function Thanks() {
  useDocumentTitle("Merci");

  return (
    <DSFRLayout title="Formulaire de contact">
      <DSFRContainer title="Merci de nous avoir contacté">
        <p className="leading-relaxed">Notre équipe met tout en oeuvre pour vous apporter une réponse dans les plus brefs délais.</p>
        <hr className="my-4" />
        <div className="flex flex-col md:flex-row gap-6 justify-end">
          <a href={knowledgebaseURL} target="_blank" rel="noopener noreferrer">
            Consulter la base de connaissance
          </a>
          <a href="https://www.snu.gouv.fr/" target="_blank" rel="noopener noreferrer">
            Consulter le site du SNU
          </a>
        </div>
      </DSFRContainer>
    </DSFRLayout>
  );
}
