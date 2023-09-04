import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { department2region, departmentList, translate } from "snu-lib";
import API from "@/services/api";
import { capture } from "@/sentry";
import { articleSummaries, questions, categories } from "../contact.utils";

import Button from "@/components/dsfr/ui/buttons/Button";
import FileImport from "@/components/dsfr/forms/FileImport";
import Input from "@/components/dsfr/forms/input";
import SearchableSelect from "@/components/dsfr/forms/SearchableSelect";
import Select from "@/components/dsfr/forms/Select";
import Solutions from "./Solutions";
import Textarea from "@/components/dsfr/forms/Textarea";

export default function PublicContactForm() {
  const history = useHistory();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form data
  const [category, setCategory] = useState(null);
  const [question, setQuestion] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);

  // Derived state
  const disabled = !message || !firstName || !lastName || !email || !department || !category || !question || loading;
  const departmentOptions = departmentList.map((d) => ({ value: d, label: d }))?.sort((a, b) => a.label.localeCompare(b.label));
  const questionOptions = questions.filter((e) => e.category === category && e.roles.includes("public"));
  const articles = articleSummaries.filter((e) => questionOptions.find((e) => e.value === question)?.articles?.includes(e.slug));

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

      const response = await API.post("/zammood/ticket/form", {
        message,
        subject: `${categories.find((e) => e.value === category)?.label} - ${questionOptions.find((e) => e.value === question)?.label}`,
        firstName,
        lastName,
        email,
        department,
        subjectStep1: category,
        subjectStep2: question,
        region: department2region[department],
        role: "young exterior",
        fromPage: new URLSearchParams(window.location.search).get("from "),
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
      <Select label="Ma demande" options={categories} value={category} onChange={setCategory} />
      {category && <Select label="Sujet" options={questionOptions} value={question} onChange={setQuestion} />}
      {articles.length > 0 && <Solutions articles={articles} showForm={showForm} setShowForm={setShowForm} />}

      {question && (articles.length === 0 || showForm) && (
        <form onSubmit={handleSubmit} disabled={disabled}>
          <label>Nom du volontaire</label>
          <Input value={firstName} onChange={setFirstName} required />

          <label className="mt-8">Prénom du volontaire</label>
          <Input value={lastName} onChange={setLastName} required />

          <label className="mt-8">Email du volontaire</label>
          <Input label="Votre email" type="email" value={email} onChange={setEmail} required />

          <br />
          <SearchableSelect label="Département" options={departmentOptions} value={department} onChange={setDepartment} required />

          <Textarea label="Votre message" value={message} onChange={(e) => setMessage(e.target.value)} />

          <p>Ajouter un fichier</p>
          <FileImport id="file" file={files[0]} setFile={(file) => setFiles([file])} />

          <hr />
          <Button type="submit" className="my-8 ml-auto" disabled={disabled}>
            Envoyer
          </Button>
        </form>
      )}
    </>
  );
}
