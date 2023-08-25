import React, { useState } from "react";
import { Link } from "react-router-dom";
import { HiArrowRight } from "react-icons/hi";
import QuestionBubble from "@/assets/icons/QuestionBubble";
import Unlock from "@/assets/icons/Unlock";
import Select from "@/components/dsfr/forms/Select";
import { formOptions } from "../contact.utils";
import { Article } from "./Article";
import Button from "@/components/dsfr/ui/buttons/Button";
import Textarea from "@/components/dsfr/forms/Textarea";
import SecondaryButton from "@/components/dsfr/ui/buttons/SecondaryButton";
import FileImport from "@/components/dsfr/forms/FileImport";
import plausibleEvent from "@/services/plausible";
import { toastr } from "react-redux-toastr";
import { translate } from "snu-lib";
import API from "@/services/api";
import { capture } from "@/sentry";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

export default function LoggedInForm() {
  const history = useHistory();

  const [step0, setStep0] = useState(null);
  const [step1, setStep1] = useState(null);
  const [step2, setStep2] = useState(null);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const step2Options = formOptions.step1.find((option) => option.value === step1)?.subOptions || [];
  const articles = step2Options.find((option) => option.value === step2)?.articles || [];
  const fromPage = new URLSearchParams(window.location.search).get("from ");

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

      const subject = `${formOptions.step1.find((option) => option.value === step1)?.label} - ${step2Options.find((option) => option.value === step2)?.label}`;

      const response = await API.post("/zammood/ticket", {
        message,
        subject,
        fromPage,
        subjectStep0: step0,
        subjectStep1: step1,
        subjectStep2: step2,
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
      <div className="my-8 flex gap-4 items-center w-full border-[1px] text-sm">
        <div className="flex-none flex items-center justify-center w-24 h-24">
          <Unlock />
        </div>
        <div>
          <p>Débloquez votre accès gratuit au code de la route</p>
          <Link to="/phase1" className="text-blue-france-sun-113 underline underline-offset-4">
            En savoir plus
            <HiArrowRight className="inline-block ml-2" />
          </Link>
        </div>
      </div>

      <div className="my-8 flex gap-4 items-center w-full border-[1px] text-sm">
        <div className="flex-none flex items-center justify-center w-24 h-24">
          <QuestionBubble />
        </div>
        <div className="p-2">
          <p className="leading-relaxed">Des questions sur le Recensement, la Journée Défense et Mémoire (JDM) ou la Journée Défense et Citoyenneté (JDC) ?</p>
          <Link to="/phase1" className="text-blue-france-sun-113 underline underline-offset-4">
            En savoir plus
            <HiArrowRight className="inline-block ml-2" />
          </Link>
        </div>
      </div>

      <Select label="Je suis" options={formOptions.step0} value={step0} onChange={setStep0} />
      {step0 && <Select label="Ma demande" options={formOptions.step1} value={step1} onChange={setStep1} />}
      {step1 && <Select label="Sujet" options={step2Options} value={step2} onChange={setStep2} />}
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
              className="my-8"
              onClick={() => {
                setShowForm(true);
                plausibleEvent("Besoin d'aide - Je n'ai pas trouve de reponse");
              }}>
              Ecrire au support
            </SecondaryButton>
          )}
        </>
      )}

      {step2 && (articles.length === 0 || showForm) && (
        <form onSubmit={handleSubmit}>
          <Textarea label="Votre message" value={message} onChange={(e) => setMessage(e.target.value)} />
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
