import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import useAuth from "@/services/useAuth";
import { department2region, translate, YOUNG_SOURCE } from "snu-lib";
import API from "@/services/api";
import { capture } from "@/sentry";
import { categories, departmentOptions, getQuestionOptions, getArticles } from "../contact.utils";

import Button from "@/components/dsfr/ui/buttons/Button";
import FileUpload, { useFileUpload } from "@/components/FileUpload";
import Input from "@/components/dsfr/forms/input";
import SearchableSelect from "@/components/dsfr/forms/SearchableSelect";
import Select from "@/components/dsfr/forms/Select";
import Solutions from "./Solutions";
import Textarea from "@/components/dsfr/forms/Textarea";
import SchoolPictogram from "@/assets/pictograms/School";
import AvatarPictogram from "@/assets/pictograms/Avatar";
import Alert from "@/components/dsfr/ui/Alert";
import { RichRadioButton } from "@/components/dsfr/forms/RichRadioButton";

export default function PublicContactForm() {
  const history = useHistory();
  const { files, addFiles, deleteFile, error } = useFileUpload();
  const { isCLE } = useAuth();

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form data
  const [parcours, setParcours] = useState(isCLE ? YOUNG_SOURCE.CLE : undefined);
  const [role, setRole] = useState(null);
  const [category, setCategory] = useState(null);
  const [question, setQuestion] = useState(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Derived state
  const disabled = !message || !firstName || !lastName || !email || !department || !category || !question || !role || loading;
  const questionOptions = getQuestionOptions(category, "public", parcours);
  const articles = getArticles(question);

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

      const response = await API.post("/zammood/ticket/form", {
        message,
        subject: `${categories.find((e) => e.value === category)?.label} - ${questionOptions.find((e) => e.value === question)?.label}`,
        firstName,
        lastName,
        email,
        department,
        role,
        parcours,
        subjectStep1: category,
        subjectStep2: question,
        region: department2region[department],
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
      <fieldset id="parcours" className="my-4 space-y-4">
        <legend className="text-base">Choisir le type de profil qui me concerne :</legend>
        <RichRadioButton
          label="Volontaire au SNU"
          description="Programme basé sur le volontariat, en dehors du temps scolaire"
          picto={<AvatarPictogram />}
          checked={parcours === YOUNG_SOURCE.VOLONTAIRE}
          onChange={() => setParcours(YOUNG_SOURCE.VOLONTAIRE)}
          disabled={isCLE}
        />
        <RichRadioButton
          label="Elève en classe engagée"
          description="Programme proposé au sein de mon établissement scolaire"
          picto={<SchoolPictogram />}
          checked={parcours === YOUNG_SOURCE.CLE}
          onChange={() => setParcours(YOUNG_SOURCE.CLE)}
          disabled={isCLE}
        />
      </fieldset>

      <Select label="Ma demande" options={categories} value={category} onChange={setCategory} />

      {category && questionOptions.length > 0 && <Select label="Sujet" options={questionOptions} value={question} onChange={setQuestion} />}

      {category && !questionOptions.length && parcours === YOUNG_SOURCE.CLE && (
        <Alert>
          <p className="text-lg font-semibold">Information</p>
          <p>Si vous avez une question sur votre parcours SNU, contactez directement votre référent classe. Il sera en mesure de vous répondre.</p>
        </Alert>
      )}

      {articles.length > 0 && <Solutions articles={articles} showForm={showForm} setShowForm={setShowForm} />}

      {question && (articles.length === 0 || showForm) && (
        <form onSubmit={handleSubmit} disabled={disabled}>
          <Select
            label="Je suis"
            options={[
              { label: "Un volontaire", value: "young" },
              { label: "Un représentant légal", value: "parent" },
            ]}
            value={role}
            onChange={setRole}
          />

          <label>Nom du volontaire</label>
          <Input value={firstName} onChange={setFirstName} required />

          <label className="mt-8">Prénom du volontaire</label>
          <Input value={lastName} onChange={setLastName} required />

          <label className="mt-8">E-mail du volontaire</label>
          <Input label="Votre email" type="email" value={email} onChange={setEmail} required />

          <br />
          <SearchableSelect label="Département" options={departmentOptions} value={department} onChange={setDepartment} required />

          <Textarea label="Votre message" value={message} onChange={(e) => setMessage(e.target.value)} />

          <FileUpload disabled={loading} files={files} addFiles={addFiles} deleteFile={deleteFile} filesAccepted={["jpeg", "png", "pdf", "word", "excel"]} />

          <hr />
          <Button type="submit" className="my-8 ml-auto" disabled={disabled}>
            Envoyer
          </Button>
        </form>
      )}
    </>
  );
}
