import React from "react";
import { useSelector } from "react-redux";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import LoggedInForm from "./components/LoggedInForm";
import LoggedOutForm from "./components/LoggedOutForm";

export default function ContactForm() {
  const young = useSelector((state) => state.Auth.young);

  return (
    <DSFRLayout title="Formulaire de contact">
      <DSFRContainer title="Je n'ai pas trouvé de réponse à ma question">
        <p className="leading-relaxed">
          Contactez nos équipes. Nous travaillons du lundi au vendredi de 9h00 à 18h00 et traiterons votre demande dès que possible. Vous recevrez une réponse par mail.
        </p>
        {young ? <LoggedInForm /> : <LoggedOutForm />}
      </DSFRContainer>
    </DSFRLayout>
  );
}
