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
import ModaleValidation from "./ModalValidation";

interface FormError {
  lastName?: string;
  firstName?: string;
  email?: string;
  uai?: string;
}

export default function Create() {
  const [etablissement, setEtablissement] = useState<Etablissement>({});
  const [errors, setErrors] = useState<FormError>({});
  const [showModal, setShowModal] = useState<"warning" | "confirm" | "validation" | "error" | null>("warning");
  const [modaleContent, setModaleContent] = useState({ title: "", text: "" });
  const [idEtablissementCreated, setIdEtablissementCreated] = useState("");

  const handleSubmit = () => {
    setErrors({});
    const errors: FormError = {};
    if (!etablissement.refLastName) errors.lastName = "Ce champ est obligatoire";
    if (!etablissement.refFirstName) errors.firstName = "Ce champ est obligatoire";
    if (!etablissement.email || !validator.isEmail(etablissement.email)) errors.email = "L'email est incorrect";
    if (!etablissement.uai) errors.uai = "Ce champ est obligatoire";
    if (etablissement.uai && etablissement.uai.length !== 8) errors.uai = "Un UAI est composé de 8 caractères";

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }
    setShowModal("confirm");
  };

  const confirmSubmit = async () => {
    setShowModal(null);
    try {
      const { ok, code, data } = await api.post("/cle/etablissement", etablissement);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la création de l'établissement", translate(code));
      }
      setIdEtablissementCreated(data._id);
      setShowModal("validation");
    } catch (e) {
      capture(e);
      if (e.code === ERRORS.USER_ALREADY_REGISTERED) {
        setModaleContent({
          title: "Erreur : adresse email déjà utilisée !",
          text: "Cette adresse email est déjà utilisée sur la plateforme : un compte a déjà été créé avec cette adresse email et il n’est pas possible d’en créer un deuxième. Veuillez vérifier et recommencer svp.",
        });
      }

      if (e.code === ERRORS.ALREADY_EXISTS) {
        setModaleContent({
          title: "Erreur : code UAI déjà utilisé !",
          text: "Cet UAI est déjà utilisé sur la plateforme : la fiche de cet établissement a déjà été créée. Veuillez vérifier et recommencer svp.",
        });
      }

      if (e.code === ERRORS.NOT_FOUND) {
        setModaleContent({
          title: "Erreur : UAI inconnu !",
          text: "Cet UAI n'est pas reconnu dans l'annuaire des établissements. Veuillez vérifier et recommencer svp.",
        });
      }
      return setShowModal("error");
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
                  active
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
      <ModaleWarning isOpen={showModal === "warning"} onClose={() => setShowModal(null)} />
      <ModaleConfirmation isOpen={showModal === "confirm"} onClose={() => setShowModal(null)} etablissement={etablissement} onConfirmSubmit={confirmSubmit} />
      <ModaleError isOpen={showModal === "error"} onClose={() => setShowModal(null)} content={modaleContent} />
      <ModaleValidation isOpen={showModal === "validation"} onClose={() => setShowModal(null)} id={idEtablissementCreated} />
    </Page>
  );
}
