import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import { supportURL } from "@/config";
import React from "react";
import { Link } from "react-router-dom";

export default function Thanks() {
  return (
    <DSFRLayout title="Formulaire de contact">
      <DSFRContainer title="Merci de nous avoir contacté">
        <p className="leading-relaxed">Notre équipe met tout en oeuvre pour vous apporter une réponse dans les plus brefs délais.</p>
        <hr className="my-8" />
        <div className="flex flex-col md:flex-row gap-4 justify-end">
          <a href={supportURL} target="_blank" rel="noopener noreferrer" className="bg-blue-france-sun-113 text-white px-4 py-2 text-center hover:bg-blue-france-sun-113-hover">
            Consulter la base de connaissance
          </a>
          <Link to="/" className="bg-blue-france-sun-113 text-white px-4 py-2 text-center hover:bg-blue-france-sun-113-hover">
            Consulter le site du SNU
          </Link>
        </div>
      </DSFRContainer>
    </DSFRLayout>
  );
}
