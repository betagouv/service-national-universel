import React from "react";
import { useHistory, useLocation } from "react-router-dom";
import { fr } from "@codegouvfr/react-dsfr";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Input } from "@codegouvfr/react-dsfr/Input";
import { PasswordInput } from "@codegouvfr/react-dsfr/blocks/PasswordInput";

import { InputPhone } from "@snu/ds/dsfr";

import { Section, Container } from "@snu/ds/dsfr";
import { toastr } from "react-redux-toastr";
import api from "@/services/api";

import SchoolInFrance from "./components/SchoolInFrance";
import Toggle from "@/components/dsfr/forms/toggle";

export default function informations({ user }) {
  const history = useHistory();
  const { search } = useLocation();
  const urlParams = new URLSearchParams(window.location.search);
  const invitationToken = urlParams.get("token");

  const [firstName, setFirstName] = React.useState(user.firstName);
  const [lastName, setLastName] = React.useState(user.lastName);

  const [schoolInFrance, setSchoolInFrance] = React.useState(true);
  const [school, setSchool] = React.useState();

  //todo : handle phone
  const [phone, setPhone] = React.useState(user.phone);

  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  const submit = async () => {
    try {
      const { ok, data, code, message } = await api.post(`/cle/referent-signup`, { firstName, lastName, phone, password, confirmPassword, invitationToken });
      if (!ok) return toastr.error(message || translate(code));
      history.push(`/creer-mon-compte/confirmation${search}`);
    } catch (error) {
      console.log(error);
      if (error?.message) return toastr.error(error?.message);
    }
  };

  return (
    <Section>
      <div className="m-auto max-w-[587px]">
        <Stepper currentStep={4} stepCount={5} title="Création d’un compte : informations" nextTitle="Confirmation" />
      </div>
      <Container className="flex flex-col gap-8">
        <div className="flex items-start justify-between">
          <h1 className="text-xl font-bold">Complétez ces informations</h1>
          <i className={fr.cx("fr-icon-question-fill", "text-[var(--background-action-high-blue-france)]")}></i>
        </div>
        <hr className="p-1" />
        <div className="flex gap-6">
          <div className="w-full">
            <Input
              label="Prénom"
              state="default"
              stateRelatedMessage="Email invalide"
              nativeInputProps={{
                placeholder: "Jean",
                value: firstName,
                onChange: (e) => setFirstName(e.target.value),
              }}
            />
          </div>
          <div className="w-full">
            <Input
              label="Nom"
              state="default"
              stateRelatedMessage="Email invalide"
              nativeInputProps={{
                placeholder: "Michel",
                value: lastName,
                onChange: (e) => setLastName(e.target.value),
              }}
            />
          </div>
        </div>
        <div className="w-full">
          <>
            <div className="flex items-center justify-between">
              <div>
                <div>
                  <span className="font-bold">Mon établissement scolaire est</span> en France
                </div>
                <div className="flex h-5 items-center">
                  <span className="text-xs leading-5 text-[#666666]">Métropolitaine ou Outre-mer</span>
                </div>
              </div>

              <Toggle onClick={() => setSchoolInFrance((e) => !e)} toggled={schoolInFrance} />
            </div>

            {schoolInFrance ? (
              <SchoolInFrance school={school} onSelectSchool={(s) => setSchool(s)} />
            ) : (
              <div>pas fait</div>
              // <SchoolOutOfFrance school={data.school} onSelectSchool={(school) => setData({ ...data, school: school })} toggleVerify={toggleVerify} corrections={corrections} />
            )}
          </>
        </div>
        <div className="flex w-full">
          <InputPhone label="Numéro de téléphone" />
        </div>
        <div className="flex flex-col gap-2">
          <div className="w-full">
            <PasswordInput label="Mot de passe" nativeInputProps={{ value: password, onChange: (e) => setPassword(e.target.value) }} />
          </div>
          <p className="text-neutral-600 text-sm">Il doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole.</p>
          <div className="w-full">
            <PasswordInput label="Confirmer votre mot de passe" nativeInputProps={{ value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value) }} />
          </div>
        </div>
        <hr className="p-1" />
        <div className="flex justify-end">
          <Button onClick={submit}>Continuer</Button>
        </div>
      </Container>
    </Section>
  );
}
