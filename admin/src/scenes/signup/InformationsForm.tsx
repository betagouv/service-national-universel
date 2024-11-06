import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import validator from "validator";
import { toastr } from "react-redux-toastr";

import Stepper from "./components/Stepper";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { PasswordInput } from "@codegouvfr/react-dsfr/blocks/PasswordInput";

import { isChefEtablissement, translate, ReferentDto, EtablissementDto } from "snu-lib";

import { Section, Container } from "@snu/ds/dsfr";

import api from "@/services/api";

interface Props {
  referent: ReferentDto;
  etablissement?: EtablissementDto;
  invitationToken: string;
  reinscription: boolean;
  onReferentChange: (referent: ReferentDto) => void;
}

export default function InformationsForm({ referent, etablissement, invitationToken, reinscription, onReferentChange }: Props) {
  const history = useHistory();
  const { search } = useLocation();

  const [firstName, setFirstName] = useState(referent.firstName || "");
  const [lastName, setLastName] = useState(referent.lastName || "");
  const [phone, setPhone] = useState(referent.phone || "");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!reinscription && password !== confirmPassword) return toastr.error("Les mots de passe ne correspondent pas", "");
      if (!validator.isMobilePhone(phone, "fr-FR")) return toastr.error("Le numéro de téléphone n'est pas valide", "");

      const { ok, code, message } = await api.post(`/cle/referent-signup`, {
        firstName,
        lastName,
        phone,
        password: reinscription ? undefined : password,
        confirmPassword: reinscription ? undefined : confirmPassword,
        invitationToken,
      });
      if (!ok) {
        return toastr.error(message || translate(code), "");
      }
      onReferentChange({ ...referent, firstName, lastName, phone });
      history.push(`/creer-mon-compte/confirmation${search}`);
    } catch (error) {
      if (error.code === "PASSWORD_NOT_VALIDATED")
        return toastr.error("Mot de passe incorrect", "Votre mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole", {
          timeOut: 10000,
        });
      return toastr.error(error?.message || translate(error?.code), "");
    }
  };

  return (
    <Section>
      {!reinscription && <Stepper currentStep={4} stepCount={5} title="Création d’un compte : informations" nextTitle="Confirmation" />}
      <form onSubmit={handleSubmit}>
        <Container className="flex flex-col gap-8">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold">Complétez ces informations</h1>
          </div>
          <hr className="p-1" />
          <div className="flex gap-6">
            <div className="w-full">
              <Input
                label="Prénom"
                state="default"
                nativeInputProps={{
                  placeholder: "Jean",
                  value: firstName,
                  onChange: (e) => setFirstName(e.target.value),
                  required: true,
                }}
              />
            </div>
            <div className="w-full">
              <Input
                label="Nom"
                state="default"
                nativeInputProps={{
                  placeholder: "Michel",
                  value: lastName,
                  onChange: (e) => setLastName(e.target.value),
                  required: true,
                }}
              />
            </div>
          </div>
          {isChefEtablissement(referent) && (
            <div className="w-full">
              <div className="flex items-center justify-between">Établissement scolaire</div>
              {etablissement ? (
                <span>
                  {etablissement?.fullName || etablissement?.name}, {etablissement?.postcode || etablissement?.zip}, {etablissement?.city}
                </span>
              ) : (
                <span className="text-gray-400 italic">Aucun établissement sélectionné</span>
              )}
            </div>
          )}
          <div className="w-full">
            {/* todo : handle phone zone */}
            <Input
              label="Numéro de téléphone"
              state="default"
              nativeInputProps={{
                placeholder: "06123456789",
                value: phone,
                onChange: (e) => setPhone(e.target.value),
                required: true,
              }}
            />
          </div>
          {!reinscription && (
            <div className="flex flex-col gap-2">
              <div className="w-full">
                <PasswordInput label="Mot de passe" nativeInputProps={{ value: password, onChange: (e) => setPassword(e.target.value), required: true }} />
              </div>
              <p className="text-neutral-600 text-sm">Il doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole.</p>
              <div className="w-full">
                <PasswordInput
                  label="Confirmer votre mot de passe"
                  nativeInputProps={{ value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), required: true }}
                />
              </div>
            </div>
          )}
          <hr className="p-1" />
          <div className="flex justify-end gap-2">
            <Button type="button" priority="secondary" onClick={() => history.goBack()}>
              Précédent
            </Button>
            <Button type="submit">Continuer</Button>
          </div>
        </Container>
      </form>
    </Section>
  );
}
