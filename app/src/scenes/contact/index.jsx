import React, { useState } from "react";
import useAuth from "@/services/useAuth";
import useDocumentTitle from "@/hooks/useDocumentTitle";

import ContactForm from "./components/ContactForm";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import PublicContactForm from "./components/PublicContactForm";
import { categories, getArticles, getQuestionOptions } from "./contact.service";
import { YOUNG_SOURCE } from "snu-lib";
import Unlock from "@/assets/icons/Unlock";
import QuestionBubbleV2 from "@/assets/icons/QuestionBubbleReimport";
import EnhancedRadioButton from "@/components/dsfr/forms/EnhancedRadioButton";
import AvatarPictogram from "@/assets/pictograms/Avatar";
import SchoolPictogram from "@/assets/pictograms/School";
import Select from "@/components/dsfr/forms/Select";
import Solutions from "./components/Solutions";
import Alert from "@/components/dsfr/ui/Alert";
import CardLink from "@/components/dsfr/ui/CardLink";

export default function Contact() {
  useDocumentTitle("Formulaire de contact");
  const { isLoggedIn, isCLE } = useAuth();

  const [parcours, setParcours] = useState(isCLE ? YOUNG_SOURCE.CLE : undefined);
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState(null);
  const [question, setQuestion] = useState(null);

  const questionOptions = getQuestionOptions(category, "public", parcours);
  const articles = getArticles(question);

  const handleSelectCategory = (value) => {
    setCategory(value);
    setQuestion(null);
    setShowForm(false);
  };

  const handleSelectQuestion = (value) => {
    setQuestion(value);
    setShowForm(false);
  };

  // If CLE users have no questions available, we display an Alert prompting them to contact their class referent.
  const shouldDisplayCleAlert = !!category && !questionOptions.length && parcours === YOUNG_SOURCE.CLE;

  // If there are articles for the selected question, we display them with a button to show the contact form. Otherwise, we show the form directly.
  const shouldDisplayForm = !!question && questionOptions.length > 0 && (articles.length === 0 || showForm);

  return (
    <DSFRLayout title="Formulaire de contact">
      <DSFRContainer title="Je n'ai pas trouvé de réponse à ma question">
        <p className="leading-relaxed mb-10">
          Contactez nos équipes. Nous travaillons du lundi au vendredi de 9h00 à 18h00 et traiterons votre demande dès que possible. Vous recevrez une réponse par mail.
        </p>

        {/* Logged in user get two links to phase 1, unlogged users are shown the parcours selector. */}
        {isLoggedIn ? (
          <>
            <CardLink label="Débloquez votre accès gratuit au code de la route" picto={<Unlock />} url="/phase1" />
            <CardLink
              label="Des questions sur le Recensement, la Journée Défense et Mémoire (JDM) ou la Journée Défense et Citoyenneté (JDC) ?"
              picto={<QuestionBubbleV2 />}
              url="/phase1"
            />
          </>
        ) : (
          <fieldset id="parcours" className="my-4 space-y-5">
            <legend className="text-base">Choisir le type de profil qui me concerne :</legend>
            <EnhancedRadioButton
              label="Volontaire au SNU"
              description="Programme basé sur le volontariat, en dehors du temps scolaire"
              picto={<AvatarPictogram />}
              checked={parcours === YOUNG_SOURCE.VOLONTAIRE}
              onChange={() => setParcours(YOUNG_SOURCE.VOLONTAIRE)}
              disabled={isCLE}
            />
            <EnhancedRadioButton
              label="Elève en classe engagée"
              description="Programme proposé au sein de mon établissement scolaire"
              picto={<SchoolPictogram />}
              checked={parcours === YOUNG_SOURCE.CLE}
              onChange={() => setParcours(YOUNG_SOURCE.CLE)}
              disabled={isCLE}
            />
          </fieldset>
        )}

        {parcours && <Select label="Ma demande" options={categories} value={category} onChange={handleSelectCategory} />}

        {shouldDisplayCleAlert && (
          <Alert className="my-8">
            <p className="text-lg font-semibold">Information</p>
            <p>Si vous avez une question sur votre parcours SNU, contactez directement votre référent classe. Il sera en mesure de vous répondre.</p>
          </Alert>
        )}

        {category && questionOptions.length > 0 && <Select label="Sujet" options={questionOptions} value={question} onChange={handleSelectQuestion} />}
        {questionOptions.length > 0 && articles.length > 0 && <Solutions articles={articles} showForm={showForm} setShowForm={setShowForm} />}
        {shouldDisplayForm && isLoggedIn && <ContactForm category={category} question={question} />}
        {shouldDisplayForm && !isLoggedIn && <PublicContactForm category={category} question={question} parcours={parcours} />}
      </DSFRContainer>
    </DSFRLayout>
  );
}
