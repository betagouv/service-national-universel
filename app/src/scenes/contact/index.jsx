import React, { useState } from "react";
import useAuth from "@/services/useAuth";
import useDocumentTitle from "@/hooks/useDocumentTitle";

import ContactForm from "./components/ContactForm";
import DSFRLayout from "@/components/dsfr/layout/DSFRLayout";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import PublicContactForm from "./components/PublicContactForm";
import { alertMessage, categories, getArticles, getCategoryFromQuestion, getQuestionOptions } from "./contact.service";
import { YOUNG_SOURCE } from "snu-lib";
import Unlock from "@/assets/icons/Unlock";
import QuestionBubbleV2 from "@/assets/icons/QuestionBubbleReimport";
import EnhancedRadioButton from "@/components/dsfr/forms/EnhancedRadioButton";
import AvatarPictogram from "@/assets/pictograms/Avatar";
import SchoolPictogram from "@/assets/pictograms/School";
import Select from "@/components/dsfr/forms/SelectV2";
import Solutions from "./components/Solutions";
import Alert from "@/components/dsfr/ui/Alert";
import CardLink from "@/components/dsfr/ui/CardLink";

export default function Contact() {
  useDocumentTitle("Formulaire de contact");
  const { isLoggedIn, young } = useAuth();

  const parcoursFromURl = new URLSearchParams(window.location.search).get("parcours");
  const showFormFromURl = new URLSearchParams(window.location.search).get("showForm");
  const questionFromURl = new URLSearchParams(window.location.search).get("q");
  const categoryFromURl = getCategoryFromQuestion(questionFromURl);

  const [parcours, setParcours] = useState(isLoggedIn ? young.source : parcoursFromURl || undefined);
  const [showForm, setShowForm] = useState(showFormFromURl === "true");
  const [category, setCategory] = useState(categoryFromURl);
  const [question, setQuestion] = useState(questionFromURl);

  const knowledgeBaseRole = isLoggedIn ? "young" : "public";
  const questionOptions = getQuestionOptions(category, knowledgeBaseRole, parcours);
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

  return (
    <DSFRLayout title="Formulaire de contact">
      <DSFRContainer title="Je n'ai pas trouvé de réponse à ma question">
        <p className="leading-relaxed mb-10">
          Contactez nos équipes. Nous travaillons du lundi au vendredi de 9h00 à 18h00 et traiterons votre demande dès que possible. Vous recevrez une réponse par mail.
        </p>

        {/* Logged in users get two links to phase 1, unlogged users are shown the parcours selector. */}
        {isLoggedIn ? (
          <div className="my-8 space-y-6">
            <CardLink label="Débloquez votre accès gratuit au code de la route" picto={<Unlock />} url="/phase1" />
            <CardLink
              label="Des questions sur le Recensement, la Journée Défense et Mémoire (JDM) ou la Journée Défense et Citoyenneté (JDC) ?"
              picto={<QuestionBubbleV2 />}
              url="/phase1"
            />
          </div>
        ) : (
          <fieldset id="parcours" className="my-10 space-y-4">
            <legend className="text-base">Choisir le type de profil qui me concerne :</legend>
            <EnhancedRadioButton
              label="Volontaire au SNU"
              description="Programme basé sur le volontariat, en dehors du temps scolaire"
              picto={<AvatarPictogram />}
              checked={parcours === YOUNG_SOURCE.VOLONTAIRE}
              onChange={() => setParcours(YOUNG_SOURCE.VOLONTAIRE)}
              disabled={parcoursFromURl}
            />
            <EnhancedRadioButton
              label="Élève en classe engagée"
              description="Programme proposé au sein de mon établissement scolaire"
              picto={<SchoolPictogram />}
              checked={parcours === YOUNG_SOURCE.CLE}
              onChange={() => setParcours(YOUNG_SOURCE.CLE)}
              disabled={parcoursFromURl}
            />
          </fieldset>
        )}

        {parcours && (
          <>
            {/* Category */}
            <Select label="Ma demande" options={categories} value={category} onChange={handleSelectCategory} disabled={categoryFromURl} name="Catégorie" />

            {/* Question */}
            {category && questionOptions.length > 0 && (
              <Select label="Sujet" options={questionOptions} value={question} onChange={handleSelectQuestion} disabled={questionFromURl} name="Question" />
            )}
            {category && questionOptions.length === 0 && (
              <Alert className="my-8">
                <p className="text-lg font-semibold">Information</p>
                <p>{alertMessage[parcours]}</p>
              </Alert>
            )}

            {/* If there are articles for the selected question, we display them with a button to show the contact form. Otherwise, we show the form directly. */}
            {question && articles.length > 0 && <Solutions articles={articles} showForm={showForm} setShowForm={setShowForm} />}
            {question &&
              (articles.length === 0 || showForm) &&
              (isLoggedIn ? <ContactForm category={category} question={question} /> : <PublicContactForm category={category} question={question} parcours={parcours} />)}
          </>
        )}
      </DSFRContainer>
    </DSFRLayout>
  );
}
