import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import validator from "validator";
import { toastr } from "react-redux-toastr";

import { fr } from "@codegouvfr/react-dsfr";
import Stepper from "./components/Stepper";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { PasswordInput } from "@codegouvfr/react-dsfr/blocks/PasswordInput";

import { ROLES, SUB_ROLES, translate } from "snu-lib";

import { Section, Container } from "@snu/ds/dsfr";

import api from "@/services/api";
import { ETABLISSEMENT_LOCAL_STORAGE_KEY } from "@/services/cle";
import Loader from "@/components/Loader";

import SchoolInFrance from "./components/SchoolInFrance";

export default function InformationsForm() {
  const history = useHistory();
  const { search } = useLocation();
  const urlParams = new URLSearchParams(search);
  const invitationToken = urlParams.get("token");
  const reinscription = urlParams.get("reinscription");

  const [user, setUser] = useState(null);

  const [firstName, setFirstName] = React.useState();
  const [lastName, setLastName] = React.useState();

  const [etablissement, setEtablissement] = React.useState();

  const [phone, setPhone] = React.useState();

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!reinscription && password !== confirmPassword) return toastr.error("Les mots de passe ne correspondent pas");
      if (!validator.isMobilePhone(phone, "fr-FR")) return toastr.error("Le numéro de téléphone n'est pas valide");
      // stocker dans local storage, pour une création de compte en plusieurs étapes
      if (etablissement) localStorage.setItem(ETABLISSEMENT_LOCAL_STORAGE_KEY, JSON.stringify(etablissement));
      const { ok, code, message } = await api.post(`/cle/referent-signup`, {
        firstName,
        lastName,
        phone,
        password: reinscription ? undefined : password,
        confirmPassword: reinscription ? undefined : confirmPassword,
        invitationToken,
      });
      if (!ok) {
        return toastr.error(message || translate(code));
      }
      history.push(`/creer-mon-compte/confirmation${search}`);
    } catch (error) {
      if (error.code === "PASSWORD_NOT_VALIDATED")
        return toastr.error("Mot de passe incorrect", "Votre mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole", {
          timeOut: 10000,
        });
      return toastr.error(error?.message || translate(error?.code));
    }
  };

  useEffect(() => {
    (async () => {
      try {
        if (!invitationToken) {
          history.push("/auth");
          return toastr.error("Votre lien d'invitation a expiré");
        }
        const { data, ok } = await api.get(`/cle/referent-signup/token/${invitationToken}`);
        if (ok && data) setUser(data.referent);
      } catch (error) {
        if (error?.code === "INVITATION_TOKEN_EXPIRED_OR_INVALID") {
          history.push("/auth");
          return toastr.error("Votre lien d'invitation a expiré");
        }
      }
    })();
  }, []);

  useEffect(() => {
    const localStorageEtablissement = localStorage.getItem(ETABLISSEMENT_LOCAL_STORAGE_KEY);
    if (localStorageEtablissement) {
      setEtablissement(JSON.parse(localStorageEtablissement));
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setPhone(user.phone);
  }, [user]);

  if (!user) return <Loader />;

  const renderSchool = () => {
    if (!user) return null;
    if (user.role === ROLES.ADMINISTRATEUR_CLE && user.subRole === SUB_ROLES.referent_etablissement) {
      return (
        <div className="w-full">
          {/* todo : flag it as required */}
          {/* todo : on reload the state seems broken : there is the city prefilled, but we no school is available in the list */}
          <div className="flex items-center justify-between">Établissement scolaire</div>
          <SchoolInFrance school={etablissement} onSelectSchool={(s) => setEtablissement(s)} />
        </div>
      );
    }
    return null;
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
          {renderSchool()}
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
