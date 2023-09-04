import React, { useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { translate } from "snu-lib";
import API from "@/services/api";
import { capture } from "@/sentry";
import { articleSummaries, questions, categories } from "../contact.utils";

import Button from "@/components/dsfr/ui/buttons/Button";
import FileUpload, { useFileUpload } from "@/components/FileUpload";
import { HiArrowRight } from "react-icons/hi";
import QuestionBubble from "@/assets/icons/QuestionBubbleReimport";
import Select from "@/components/dsfr/forms/Select";
import Textarea from "@/components/dsfr/forms/Textarea";
import Unlock from "@/assets/icons/Unlock";
import Solutions from "./Solutions";

export default function ContactForm() {
  const history = useHistory();
  const { files, addFiles, deleteFile, error } = useFileUpload();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form data
  const [role, setRole] = useState(null);
  const [category, setCategory] = useState(null);
  const [question, setQuestion] = useState(null);
  const [message, setMessage] = useState("");

  // Derived state
  const questionOptions = questions.filter((e) => e.category === category && e.roles.includes("young"));
  const articles = articleSummaries.filter((e) => questionOptions.find((e) => e.value === question)?.articles?.includes(e.slug));

  useEffect(() => {
    if (error) {
      toastr.error(error, "");
    }
  }, [error]);

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
        uploadedFiles = filesResponse.data;
      }

      const response = await API.post("/zammood/ticket", {
        message,
        subject: `${categories.find((e) => e.value === category)?.label} - ${questionOptions.find((e) => e.value === question)?.label}`,
        fromPage: new URLSearchParams(window.location.search).get("from "),
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
      setLoading(false);
      capture(e);
      toastr.error("Oups, une erreur est survenue", translate(e.code));
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

      <Select
        label="Je suis"
        options={[
          { label: "Un volontaire", value: "young" },
          { label: "Un représentant légal", value: "parent" },
        ]}
        value={role}
        onChange={setRole}
      />
      {role && <Select label="Ma demande" options={categories} value={category} onChange={setCategory} />}
      {category && <Select label="Sujet" options={questionOptions} value={question} onChange={setQuestion} />}
      {articles.length > 0 && <Solutions articles={articles} showForm={showForm} setShowForm={setShowForm} />}

      {question && (articles.length === 0 || showForm) && (
        <form onSubmit={handleSubmit}>
          <Textarea label="Votre message" value={message} onChange={(e) => setMessage(e.target.value)} />
          <p>Ajouter un fichier</p>
          <FileUpload disabled={loading} files={files} addFiles={addFiles} deleteFile={deleteFile} filesAccepted={["jpeg", "png", "pdf", "word", "excel"]} />
          <hr />
          <Button type="submit" className="my-8 ml-auto" disabled={!message || loading}>
            Envoyer
          </Button>
        </form>
      )}
    </>
  );
}
