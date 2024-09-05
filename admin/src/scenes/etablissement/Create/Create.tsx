import React, { useState } from "react";
import { HiHome } from "react-icons/hi";
import { Link } from "react-router-dom";
import validator from "validator";
import { toastr } from "react-redux-toastr";

import { translate, ERRORS } from "snu-lib";
import { capture } from "@/sentry";
import api from "@/services/api";
import { Page, Header, Container, Label, InputText, Button } from "@snu/ds/admin";

import { Etablissement } from "./type";
import ModaleWarning from "./ModalWarning";
import ModaleConfirmation from "./ModalConfirmation";
import ModaleError from "./ModalError";
import ModalValidation from "./ModalValidation";

interface FormError {
  lastName?: string;
  firstName?: string;
  email?: string;
  uai?: string;
}

export default function Create() {
  const [etablissement, setEtablissement] = useState<Etablissement>({});
  const [errors, setErrors] = useState<FormError>({});
  const [modalWarning, setModalWarning] = useState(true);
  const [modalConfirmation, setModalConfirmation] = useState(false);
  const [modalValidation, setModalValidation] = useState(false);
  const [modalError, setModalError] = useState(false);
  const [titleError, setTitleError] = useState("");
  const [textError, setTextError] = useState("");
  const [idEtablissementCreated, setIdEtablissementCreated] = useState("");

  const handleSubmit = () => {
    setErrors({});
    const errors: FormError = {};
    if (!etablissement.refLastName) errors.lastName = "Ce champ est obligatoire";
    if (!etablissement.refFirstName) errors.firstName = "Ce champ est obligatoire";
    if (!etablissement.email || !validator.isEmail(etablissement.email)) errors.email = "L'email est incorrect";
    if (!etablissement.uai) errors.uai = "Ce champ est obligatoire";

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    setModalConfirmation(true);
  };

  const confirmSubmit = async () => {
    setModalConfirmation(false);
    try {
      const { ok, code, data } = await api.post("/cle/etablissement", etablissement);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la création de l'établissement", translate(code));
      }
      setIdEtablissementCreated(data._id);
      toastr.success("La classe a bien été créée", "");
    } catch (e) {
      capture(e);
      if (e.code === ERRORS.USER_ALREADY_REGISTERED) {
        setTitleError("Erreur : adresse email déjà utilisée !");
        setTextError(
          "Cette adresse email est déjà utilisée sur la plateforme : un compte a déjà été créé avec cette adresse email et il n’est pas possible d’en créer un deuxième. Veuillez vérifier et recommencer svp.",
        );
        return setModalError(true);
      }

      if (e.code === ERRORS.ALREADY_EXISTS) {
        setTitleError("Erreur : code UAI déjà utilisé !");
        setTextError("Cet UAI est déjà utilisé sur la plateforme : la fiche de cet établissement a déjà été créée. Veuillez vérifier et recommencer svp.");
        return setModalError(true);
      }

      if (e.code === ERRORS.NOT_FOUND) {
        setTitleError("Erreur : UAI inconnu !");
        setTextError("Cet UAI n'est pas reconnu dans l'annuaire des établissements. Veuillez vérifier et recommencer svp.");
        return setModalError(true);
      }

      toastr.error("Oups, une erreur est survenue lors de la création de l'établissement", "");
    } finally {
      setModalValidation(true);
    }
  };

  return (
    <Page>
      <Header
        title="Création d’un établissement"
        breadcrumb={[{ title: <HiHome size={20} className="text-gray-400 hover:text-gray-500" />, to: "/" }, { title: "Séjours" }, { title: "Créer un établissement" }]}
      />
      <Container title="Informations générales">
        <div className="flex items-stretch justify-between mt-8">
          <div className="flex-1 shrink-0">
            <div>
              <Label title="UAI de l'établissement" name="uai" className="!font-[500]" />
              <div className="flex items-center justify-between gap-3">
                <InputText
                  name="uai"
                  className="flex-1"
                  active={true}
                  placeholder="Préciser"
                  value={etablissement.uai!}
                  error={errors.uai}
                  max={8}
                  onChange={(e) => setEtablissement({ ...etablissement, uai: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-8">
              <Label title="Adresse email de l'établissement" name="email" className="!font-[500]" />
              <div className="flex items-center justify-between gap-3">
                <InputText
                  name="email"
                  className="flex-1"
                  active={true}
                  placeholder="Préciser"
                  value={etablissement.email!}
                  error={errors.email}
                  onChange={(e) => setEtablissement({ ...etablissement, email: e.target.value })}
                />
              </div>
            </div>
          </div>
          <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
          <div className="flex-1 shrink-0">
            <div>
              <Label title="Nom du chef d'établissement" name="lastName" className="!font-[500]" />
              <div className="flex items-center justify-between gap-3">
                <InputText
                  name="lastName"
                  className="flex-1"
                  active={true}
                  placeholder="Préciser"
                  value={etablissement.refLastName!}
                  error={errors.lastName}
                  onChange={(e) => setEtablissement({ ...etablissement, refLastName: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-8">
              <Label title="Prénom du chef d'établissement" name="firstName" className="!font-[500]" />
              <div className="flex items-center justify-between gap-3">
                <InputText
                  name="firstName"
                  className="flex-1"
                  active={true}
                  placeholder="Préciser"
                  value={etablissement.refFirstName!}
                  error={errors.firstName}
                  onChange={(e) => setEtablissement({ ...etablissement, refFirstName: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
      </Container>
      <Container>
        <div className="flex justify-end gap-4 mt-2">
          <Link key="cancel" to="/etablissement">
            <Button title="Annuler" type="secondary" />
          </Link>
          <Button key="create" title="Enregistrer et créer cet établissement" onClick={() => handleSubmit()} />
        </div>
      </Container>
      <ModaleWarning isOpen={modalWarning} onClose={() => setModalWarning(false)} />
      <ModaleConfirmation isOpen={modalConfirmation} onClose={() => setModalConfirmation(false)} etablissement={etablissement} onConfirmSubmit={confirmSubmit} />
      <ModaleError isOpen={modalError} onClose={() => setModalError(false)} title={titleError} text={textError} />
      <ModalValidation isOpen={modalValidation} onClose={() => setModalValidation(false)} id={idEtablissementCreated} />
    </Page>
  );
}
