import React from "react";
import { useSelector } from "react-redux";
import useDocumentTitle from "@/hooks/useDocumentTitle";

import ContactForm from "./components/ContactForm";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import PublicContactForm from "./components/PublicContactForm";

export default function Contact() {
  useDocumentTitle("Formulaire de contact");
  const young = useSelector((state) => state.Auth.young);

  // TODO: fetch questions and articles from API

  return (
    <DSFRLayout title="Formulaire de contact">
      <DSFRContainer title="Je n'ai pas trouvé de réponse à ma question">
        <p className="leading-relaxed">
          Contactez nos équipes. Nous travaillons du lundi au vendredi de 9h00 à 18h00 et traiterons votre demande dès que possible. Vous recevrez une réponse par mail.
        </p>
        {young ? <ContactForm /> : <PublicContactForm />}
      </DSFRContainer>
    </DSFRLayout>
  );
}
