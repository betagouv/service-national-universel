import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { translate } from "snu-lib";
import plausibleEvent from "@/services/plausible";
import API from "@/services/api";
import { capture } from "@/sentry";
import { roles, categories, articleSummaries, questions } from "../contact.utils";

import Article from "./Article";
import Button from "@/components/dsfr/ui/buttons/Button";
import FileImport from "@/components/dsfr/forms/FileImport";
import { HiArrowRight } from "react-icons/hi";
import QuestionBubble from "@/assets/icons/QuestionBubbleReimport";
import SecondaryButton from "@/components/dsfr/ui/buttons/SecondaryButton";
import Select from "@/components/dsfr/forms/Select";
import Textarea from "@/components/dsfr/forms/Textarea";
import Unlock from "@/assets/icons/Unlock";

export default function ContactForm() {
  const history = useHistory();
  const fromPage = new URLSearchParams(window.location.search).get("from ");

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form data
  const [role, setRole] = useState(null);
  const [category, setCategory] = useState(null);
  const [question, setQuestion] = useState(null);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);

  // Derived state
  const categoryOptions = questions.filter((e) => e.category === category);
  const articles = articleSummaries.filter((e) => categoryOptions.find((e) => e.value === question)?.articles?.includes(e.slug));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let uploadedFiles;
      if (files.length > 0) {
        const filesResponse = await API.uploadFiles("/zammood/upload", files);
        if (!filesResponse?.ok) {
          setLoading(false);
          const translationKey = filesResponse.code === "FILE_SCAN_DOWN" ? "FILE_SCAN_DOWN_SUPPORT" : filesResponse.code;
          return toastr.error("Une erreur s'est produite lors de l'upload des fichiers :", translate(translationKey), { timeOut: 5000 });
        }
        uploadedFiles = filesResponse.uploadFiles;
      }

      const subject = `${categories.find((e) => e.value === category)?.label} - ${categoryOptions.find((e) => e.value === question)?.label}`;

      const response = await API.post("/zammood/ticket", {
        message,
        subject,
        fromPage,
        subjectStep0: role,
        subjectStep1: category,
        subjectStep2: question,
        files: uploadedFiles,
      });
      if (!response.ok) {
        setLoading(false);
        return toastr.error("Une erreur s'est produite lors de la création de ce ticket :", translate(response.code));
      }
      history.push("/merci");
    } catch (e) {
      capture(e);
      toastr.error("Oups, une erreur est survenue", translate(e.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="my-8 flex gap-4 p-2 items-center w-full border-[1px] text-sm">
        <div className="flex-none flex items-center justify-center w-12 md:w-24 h-24">
          <Unlock />
        </div>
        <div>
          <p className="leading-relaxed">Débloquez votre accès gratuit au code de la route</p>
          <Link to="/phase1" className="text-blue-france-sun-113 underline underline-offset-4">
            En savoir plus
            <HiArrowRight className="inline-block ml-2" />
          </Link>
        </div>
      </div>

      <div className="my-8 flex gap-4 p-2 items-center w-full border-[1px] text-sm">
        <div className="flex-none flex items-center justify-center w-12 md:w-24 h-24">
          <QuestionBubble />
        </div>
        <div>
          <p className="leading-relaxed">Des questions sur le Recensement, la Journée Défense et Mémoire (JDM) ou la Journée Défense et Citoyenneté (JDC) ?</p>
          <Link to="/phase1" className="text-blue-france-sun-113 underline underline-offset-4">
            En savoir plus
            <HiArrowRight className="inline-block ml-2" />
          </Link>
        </div>
      </div>

      <Select label="Je suis" options={roles} value={role} onChange={setRole} />
      {role && <Select label="Ma demande" options={categories} value={category} onChange={setCategory} />}
      {category && <Select label="Sujet" options={categoryOptions} value={question} onChange={setQuestion} />}
      {articles.length > 0 && (
        <>
          <h2 className="text-xl font-semibold mb-4">Solutions proposées</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {articles.map((e) => (
              <Article key={e.slug} article={e} />
            ))}
          </div>
          {!showForm && (
            <SecondaryButton
              className="my-8 w-full md:w-auto"
              onClick={() => {
                setShowForm(true);
                plausibleEvent("Besoin d'aide - Je n'ai pas trouve de reponse");
              }}>
              Ecrire au support
            </SecondaryButton>
          )}
        </>
      )}

      {question && (articles.length === 0 || showForm) && (
        <form onSubmit={handleSubmit}>
          <Textarea label="Votre message" value={message} onChange={(e) => setMessage(e.target.value)} />
          <p>Ajouter un fichier</p>
          <FileImport id="file" file={files[0]} setFile={(file) => setFiles([file])} />
          <hr />
          <Button type="submit" className="my-8 ml-auto" disabled={!message || loading}>
            Envoyer
          </Button>
        </form>
      )}
    </>
  );
}
