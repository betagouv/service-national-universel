import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { fr } from "@codegouvfr/react-dsfr";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { Section, Container } from "@snu/ds/dsfr";
import { translate } from "snu-lib";
import api from "@/services/api";

export default function confirmation() {
  const history = useHistory();
  const [etablissement, setEtablissement] = useState("");
  const LOCAL_STORAGE_KEY = "cle_inscription_school";
  const { search } = useLocation();

  const urlParams = new URLSearchParams(window.location.search);
  const invitationToken = urlParams.get("token");

  const [user, setUser] = useState(null);
  const [cguChecked, setCguChecked] = useState(false);
  const [donneesChecked, setDonneesChecked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        if (!invitationToken) return toastr.error("Votre lien d'invitation a expiré");
        const { data, ok } = await api.get(`/cle/referent-signup/token/${invitationToken}`);
        if (ok && data) setUser(data);
      } catch (error) {
        if (error?.code === "INVITATION_TOKEN_EXPIRED_OR_INVALID") return toastr.error("Votre lien d'invitation a expiré");
      }
    })();
  }, []);

  const getEtablissement = async () => {
    const localStorageEtablissement = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localStorageEtablissement) {
      setEtablissement(JSON.parse(localStorageEtablissement));
    }
  };

  useEffect(() => {
    getEtablissement();
  }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const schoolLocalStorage = localStorage.getItem(LOCAL_STORAGE_KEY);
      const school = JSON.parse(schoolLocalStorage);
      const response = await api.post("/cle/referent-signup/confirm-signup", { schoolId: school.id.toString(), invitationToken });

      // todo : refirect to the auth screen
      history.push("/auth");
    } catch (e) {
      console.log(e);
    }
  };

  if (!user) return <div>Chargement...</div>;

  return (
    <Section>
      <div className="m-auto max-w-[587px]">
        <Stepper currentStep={5} stepCount={5} title="Création d’un compte : confirmation" />
      </div>
      <form onSubmit={submit}>
        <Container className="flex flex-col gap-8">
          <div className="flex items-start justify-between">
            <h1 className="text-xl font-bold">Validez vos informations</h1>
            <i className={fr.cx("fr-icon-question-fill", "text-[var(--background-action-high-blue-france)]")}></i>
          </div>
          <hr className="p-1" />
          <div>
            <div className="flex items-start justify-between">
              <h2 className="text-lg">Mon profil</h2>
              <i className={fr.cx("fr-icon-edit-fill", "text-[var(--background-action-high-blue-france)] cursor-pointer")} onClick={() => history.goBack()}></i>
            </div>
            <div className="flex items-start justify-between">
              <div className="text-[#666]">Établissement scolaire :</div>
              <div className="text-right text-[#161616]">
                {etablissement?.fullName}, {etablissement?.postcode}, {etablissement?.city}
              </div>
            </div>
            <div className="flex items-start justify-between">
              <div className="text-[#666]">Rôle :</div>
              <div className="text-right text-[#161616]">{translate(user.role)}</div>
            </div>
            <div className="flex items-start justify-between">
              <div className="text-[#666]">Fonction :</div>
              <div className="text-right text-[#161616]">{translate(user.subRole)}</div>
            </div>
            <div className="flex items-start justify-between">
              <div className="text-[#666]">Prénom :</div>
              <div className="text-right text-[#161616]">{user.firstName}</div>
            </div>
            <div className="flex items-start justify-between">
              <div className="text-[#666]">Nom :</div>
              <div className="text-right text-[#161616]">{user.lastName}</div>
            </div>
            <div className="flex items-start justify-between">
              <div className="text-[#666]">Numéro de téléphone :</div>
              <div className="text-right text-[#161616]">{user.phone}</div>
            </div>
          </div>
          <div>
            <div className="flex items-start justify-between">
              <h2 className="text-lg">Mon compte</h2>
              <i
                className={fr.cx("fr-icon-edit-fill", "text-[var(--background-action-high-blue-france)] cursor-pointer")}
                onClick={() => history.push(`/creer-mon-compte/email${search}`)}></i>
            </div>
            <div className="flex items-start justify-between">
              <div className="text-[#666]">Adresse email :</div>
              <div className="text-right text-[#161616]">{user.email}</div>
            </div>
          </div>
          <hr className="p-1" />
          <Checkbox
            options={[
              {
                label: (
                  <p className="p-0 m-0 !pl-8">
                    J'ai lu et j'accepte les <a href="#">Conditions Générales d'Utilisation (CGU)</a> de la plateforme du Service National Universel.
                  </p>
                ),
                nativeInputProps: {
                  name: "checkboxes-1",
                  value: cguChecked,
                  onClick: () => setCguChecked((e) => !e),
                  required: true,
                },
              },
              {
                label: (
                  <p className="p-0 m-0 !pl-8">
                    J’ai pris connaissance des <a href="#">modalités de traitement de mes données personnelles</a>.
                  </p>
                ),
                nativeInputProps: {
                  name: "checkboxes-1",
                  value: donneesChecked,
                  onClick: () => setDonneesChecked((e) => !e),
                  required: true,
                },
              },
            ]}
            small
          />
          <hr className="p-1" />
          <div className="flex justify-end">
            <Button type="submit">Valider</Button>
          </div>
        </Container>
      </form>
    </Section>
  );
}
