import React, { useState } from "react";
import { HiHome } from "react-icons/hi";
import { Link, useHistory } from "react-router-dom";
import validator from "validator";
import { toastr } from "react-redux-toastr";

import { translate } from "snu-lib";
import { capture } from "@/sentry";
import api from "@/services/api";
import { Page, Header, Container, Label, InputText, Button } from "@snu/ds/admin";

import { Etablissement } from "./type";
import ModaleWarning from "./ModalWarning";
import ModaleConfirmation from "./ModalConfirmation";

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
  const history = useHistory();

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
    console.log("etablissement", etablissement);
    /*     try {
      const { ok, code, data } = await api.post("/cle/etablissement", etablissement);
      if (!ok) {
        return toastr.error("Oups, une erreur est survenue lors de la création de l'établissement", translate(code));
      }
      toastr.success("La classe a bien été créée", "");
      history.push("/etablissement/" + data._id);
    } catch (e) {
      capture(e);
            if (e.code === ERRORS.USER_ALREADY_REGISTERED)
        return toastr.error("Cette adresse email est déjà utilisée. Si vous souhaitez désigner un referent de classe existant pour cette classe, utilisez le menu Select", "", {
          timeOut: 10000,
        });
      if (e.code === ERRORS.ALREADY_EXISTS)
        return toastr.error("Une classe avec les même caractéristiques existe déjá. Utilisez le nom pour les différencier", "", {
          timeOut: 10000,
        });
      toastr.error("Oups, une erreur est survenue lors de la création de la classe", "");
    } */
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
                  placeholder="Choisir"
                  value={etablissement.uai!}
                  error={errors.uai}
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
    </Page>
  );
}
