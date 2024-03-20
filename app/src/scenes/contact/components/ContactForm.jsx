import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { translate } from "snu-lib";
import API from "@/services/api";
import { capture } from "@/sentry";
import { categories, getQuestions, roleOptions } from "../contact.service";
import useAuth from "@/services/useAuth";

import Button from "@/components/dsfr/ui/buttons/Button";
import FileUpload, { useFileUpload } from "@/components/FileUpload";
import Select from "@/components/dsfr/forms/Select";
import Textarea from "@/components/dsfr/forms/Textarea";
import ErrorMessage from "@/components/dsfr/forms/ErrorMessage";

export default function ContactForm({ category, question, parcours }) {
  const { young } = useAuth();
  const history = useHistory();
  const { files, addFiles, deleteFile, error } = useFileUpload();

  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const [message, setMessage] = useState("");

  const disabled = () => {
    if (loading) return true;
    if (!role || !category || !question || !message) return true;
    return false;
  };

  const questions = getQuestions(category, "young", young.source);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let uploadedFiles;
      if (files.length > 0) {
        const filesResponse = await API.uploadFiles("/SNUpport/upload", files);
        if (!filesResponse?.ok) {
          setLoading(false);
          const translationKey = filesResponse.code === "FILE_SCAN_DOWN" ? "FILE_SCAN_DOWN_SUPPORT" : filesResponse.code;
          return toastr.error("Une erreur s'est produite lors de l'upload des fichiers :", translate(translationKey), { timeOut: 5000 });
        }
        uploadedFiles = filesResponse.data;
      }

      const response = await API.post("/SNUpport/ticket", {
        message,
        subject: `${categories.find((e) => e.value === category)?.label} - ${questions.find((e) => e.value === question)?.label}`,
        fromPage: new URLSearchParams(window.location.search).get("from "),
        parcours,
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
    <form onSubmit={handleSubmit}>
      <Select label="Je suis" name="Role" options={roleOptions} value={role} onChange={setRole} />
      <Textarea label="Votre message" value={message} onChange={(e) => setMessage(e.target.value)} />
      <FileUpload disabled={loading} files={files} addFiles={addFiles} deleteFile={deleteFile} filesAccepted={["jpeg", "png", "pdf", "word", "excel"]} />
      <ErrorMessage error={error} />
      <hr />
      <Button type="submit" className="my-8 ml-auto" disabled={disabled()}>
        Envoyer
      </Button>
    </form>
  );
}
