import React, { useEffect, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { fr } from "@codegouvfr/react-dsfr";
import Stepper from "./components/Stepper";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";
import { toastr } from "react-redux-toastr";

import { ROLES, translate } from "snu-lib";
import { Section, Container } from "@snu/ds/dsfr";
import api from "@/services/api";
import Loader from "@/components/Loader";

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
        if (ok && data) setUser(data.referent);

        if (data.etablissement) {
          setEtablissement(data.etablissement);
        } else {
          const localStorageEtablissement = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (localStorageEtablissement) {
            setEtablissement(JSON.parse(localStorageEtablissement));
          }
        }
      } catch (error) {
        if (error?.code === "INVITATION_TOKEN_EXPIRED_OR_INVALID") return toastr.error("Votre lien d'invitation a expiré");
      }
    })();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const body = { invitationToken };
      const schoolLocalStorage = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (schoolLocalStorage) {
        const school = JSON.parse(schoolLocalStorage);
        body.schoolId = school.id.toString();
      }
      const response = await api.post("/cle/referent-signup/confirm-signup", body);
      if (!response.ok) {
        return toastr.error(response.message || translate(response.code));
      }

      // todo : refirect to the auth screen
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      localStorage.setItem("cle_referent_signup_first_time", true);
      toastr.success("Votre compte a bien été créé. Vous pouvez maintenant vous connecter.");
      history.push("/auth");
    } catch (e) {
      console.log(e);
    }
  };

  if (!user) return <Loader />;

  return (
    <Section>
      <Stepper currentStep={5} stepCount={5} title="Création d’un compte : confirmation" />
      <form onSubmit={submit}>
        <Container className="flex flex-col gap-8">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold">Validez vos informations</h1>
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
                {etablissement ? (
                  <span>
                    {etablissement?.fullName || etablissement?.name}, {etablissement?.postcode || etablissement?.zip}, {etablissement?.city}
                  </span>
                ) : (
                  <span className="text-gray-400 italic">Aucun établissement sélectionné</span>
                )}
              </div>
            </div>
            <div className="flex items-start justify-between">
              <div className="text-[#666]">Rôle :</div>
              <div className="text-right text-[#161616]">{translate(user.role)}</div>
            </div>
            {user.role === ROLES.ADMINISTRATEUR_CLE ? (
              <div className="flex items-start justify-between">
                <div className="text-[#666]">Fonction :</div>
                <div className="text-right text-[#161616]">{translate(user.subRole)}</div>
              </div>
            ) : null}
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
                  <p className="p-0 m-0 !pl-8 text-sm">
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
                  <p className="p-0 m-0 !pl-8 text-sm">
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
