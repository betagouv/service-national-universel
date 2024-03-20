import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { department2region, translate } from "snu-lib";
import API from "@/services/api";
import { capture } from "@/sentry";
import { categories, departmentOptions, getClasseIdFromLink, getQuestions, roleOptions } from "../contact.service";

import Button from "@/components/dsfr/ui/buttons/Button";
import FileUpload, { useFileUpload } from "@/components/FileUpload";
import Input from "@/components/dsfr/forms/input";
import SearchableSelect from "@/components/dsfr/forms/SearchableSelect";
import Select from "@/components/dsfr/forms/Select";
import Textarea from "@/components/dsfr/forms/Textarea";
import ErrorMessage from "@/components/dsfr/forms/ErrorMessage";
import MyClass from "@/scenes/cle/MyClass";
import { useQuery } from "@tanstack/react-query";
import { fetchClass } from "@/services/classe.service";
import { validateId } from "@/utils";

export default function PublicContactForm({ category, question, parcours }) {
  const history = useHistory();
  const { files, addFiles, deleteFile, error } = useFileUpload();

  const [loading, setLoading] = useState(false);
  const [link, setLink] = useState("");
  const [role, setRole] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [department, setDepartment] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const params = new URLSearchParams(window.location.search);
  const classeIdFromURL = params.get("classeId");
  const classeIdFromLink = getClasseIdFromLink(link);
  const classeId = classeIdFromURL || classeIdFromLink;

  const {
    isPending,
    isError,
    data: classe,
  } = useQuery({
    queryKey: ["class", classeId],
    queryFn: () => fetchClass(classeId),
    enabled: validateId(classeId),
  });

  const questions = getQuestions(category, "public", parcours);

  const disabled = () => {
    if (loading) return true;
    if (!role || !category || !question || !firstName || !lastName || !email || !department) return true;
    if (!message) return true;
    return false;
  };

  useEffect(() => {
    if (classe?.name && classe?.etablissement) {
      const classeString = `J'ai un compte volontaire et je souhaite m'inscrire au SNU dans le cadre de ma classe engagée : ${classe?.name}, établissement : ${classe?.etablissement?.name}.`;
      setMessage(classeString);
    }
  }, [classe?.name, classe?.etablissement]);

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

      const response = await API.post("/SNUpport/ticket/form", {
        message,
        subject: `${categories.find((e) => e.value === category)?.label} - ${questions.find((e) => e.value === question)?.label}`,
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
        classeId: classe?.id,
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
    <form onSubmit={handleSubmit} disabled={disabled()} autoComplete="on">
      {question === "HTS_TO_CLE" && !classeIdFromURL && (
        <>
          <label className="w-full">
            Lien transmis par le référent
            <Input value={link} onChange={setLink} name="link" />
          </label>
          {link && !classeIdFromLink && (
            <ErrorMessage>Ce lien semble invalide. Veuillez vérifier que vous avez bien copié l'URL complète du lien qui vous a été transmis.</ErrorMessage>
          )}
        </>
      )}
      {question === "HTS_TO_CLE" && classeId && (
        <div className="flex items-center border my-12 px-8 py-4">
          {isPending && <p className="animate-pulse text-center">Chargement de la classe...</p>}
          {isError && <p className="text-center">Impossible de récupérer les informations de votre classe engagée 🤔</p>}
          {classe && <MyClass classe={classe} />}
        </div>
      )}
      <Select label="Je suis" name="Role" options={roleOptions} value={role} onChange={setRole} />

      <label className="w-full">
        Nom du volontaire
        <Input value={firstName} onChange={setFirstName} name="lastname" required />
      </label>

      <label className="w-full mt-8">
        Prénom du volontaire
        <Input value={lastName} onChange={setLastName} name="firstname" required />
      </label>

      <label className="w-full my-8">
        E-mail du volontaire
        <Input label="Votre email" type="email" value={email} onChange={setEmail} name="email" autocomplete="on" required />
      </label>

      <br />
      <SearchableSelect label="Département" options={departmentOptions} value={department} onChange={setDepartment} required />

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
