import React, { useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Checkbox } from "@codegouvfr/react-dsfr/Checkbox";

import { isAdminCle, translate } from "snu-lib";
import { ReferentDto } from "snu-lib/src/dto";
import { EtablissementDto } from "snu-lib/src/dto/etablissementDto";
import { Section, Container } from "@snu/ds/dsfr";

import api from "@/services/api";

import Stepper from "./components/Stepper";
import { REFERENT_SIGNUP_FIRSTTIME_LOCAL_STORAGE_KEY } from "@/services/cle";

interface Props {
  referent: ReferentDto;
  etablissement?: EtablissementDto;
  invitationToken: string;
  reinscription: boolean;
}

export default function ConfirmationForm({ referent, etablissement, invitationToken, reinscription }: Props) {
  const history = useHistory();
  const { search } = useLocation();

  const [cguChecked, setCguChecked] = useState(false);
  const [donneesChecked, setDonneesChecked] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body: { invitationToken: string | null } = { invitationToken };
      const response = await api.post("/cle/referent-signup/confirm-signup", body);
      if (!response.ok) {
        return toastr.error(response.message || translate(response.code), "");
      }

      localStorage.setItem(REFERENT_SIGNUP_FIRSTTIME_LOCAL_STORAGE_KEY, String(true));
      toastr.success("Votre compte a bien été créé. Vous pouvez maintenant vous connecter.", "", { timeOut: 5000 });
      history.push("/auth");
    } catch (e) {
      if (e.ok == false) {
        return toastr.error(e.message || translate(e.code), "");
      } else {
        console.log(e);
      }
    }
  };

  return (
    <Section>
      {!reinscription && <Stepper currentStep={5} stepCount={5} title="Création d’un compte : confirmation" />}
      <form onSubmit={handleSubmit}>
        <Container className="flex flex-col gap-8">
          <div className="flex items-start justify-between">
            <h1 className="text-2xl font-bold">Validez vos informations</h1>
          </div>
          <hr className="p-1" />
          <div>
            <div className="flex items-start justify-between">
              <h2 className="text-lg">Mon profil</h2>
              <i
                className={fr.cx("fr-icon-edit-fill", "text-[var(--background-action-high-blue-france)] cursor-pointer" as any)}
                onClick={() => history.push(`/creer-mon-compte/informations${search}`)}></i>
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
              <div className="text-right text-[#161616]">{translate(referent.role)}</div>
            </div>
            {isAdminCle(referent) && (
              <div className="flex items-start justify-between">
                <div className="text-[#666]">Fonction :</div>
                <div className="text-right text-[#161616]">{translate(referent.subRole)}</div>
              </div>
            )}
            <div className="flex items-start justify-between">
              <div className="text-[#666]">Prénom :</div>
              <div className="text-right text-[#161616]">{referent.firstName}</div>
            </div>
            <div className="flex items-start justify-between">
              <div className="text-[#666]">Nom :</div>
              <div className="text-right text-[#161616]">{referent.lastName}</div>
            </div>
            <div className="flex items-start justify-between">
              <div className="text-[#666]">Numéro de téléphone :</div>
              <div className="text-right text-[#161616]">{referent.phone}</div>
            </div>
          </div>
          <div>
            <div className="flex items-start justify-between">
              <h2 className="text-lg">Mon compte</h2>
              <i
                className={fr.cx("fr-icon-edit-fill", "text-[var(--background-action-high-blue-france)] cursor-pointer" as any)}
                onClick={() => history.push(`/creer-mon-compte/email${search}`)}></i>
            </div>
            <div className="flex items-start justify-between">
              <div className="text-[#666]">Adresse email :</div>
              <div className="text-right text-[#161616]">{referent.email}</div>
            </div>
          </div>
          {!reinscription && (
            <>
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
                      value: String(cguChecked),
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
                      value: String(donneesChecked),
                      onClick: () => setDonneesChecked((e) => !e),
                      required: true,
                    },
                  },
                ]}
                small
              />
            </>
          )}
          <hr className="p-1" />
          <div className="flex justify-end">
            <Button type="submit">Valider</Button>
          </div>
        </Container>
      </form>
    </Section>
  );
}
