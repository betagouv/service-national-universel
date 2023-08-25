import dayjs from "dayjs";
import "dayjs/locale/fr";
import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { COHESION_STAY_START, translate } from "snu-lib";
import StickyButton from "../../../components/inscription/stickyButton";
import Loader from "../../../components/Loader";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";
import api from "../../../services/api";
import { API_DECLARATION_CNI_INVALIDE } from "../commons";
import Check from "../components/Check";
import plausibleEvent from "../../../services/plausible";

export default function CniInvalide() {
  const history = useHistory();
  const { young, token } = useContext(RepresentantsLegauxContext);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (young) {
      if (young.parentStatementOfHonorInvalidId === "true" || young.parentStatementOfHonorInvalidId === "false") {
        history.push(`/representants-legaux/cni-invalide-done?token=${token}`);
      }
    }
  }, [young]);

  if (!young) return <Loader />;

  const youngFullname = young.firstName + " " + young.lastName;
  const parentFullname = young.parent1FirstName + " " + young.parent1LastName;
  const dateSejour = COHESION_STAY_START[young.cohort] ? dayjs(COHESION_STAY_START[young.cohort]).locale("fr").format("D MMMM YYYY") : young.cohort;

  async function onSubmit() {
    setSaving(true);
    setError(null);

    if (validated) {
      try {
        const { code, ok } = await api.post(API_DECLARATION_CNI_INVALIDE + `?token=${token}`, { validated: true });
        if (!ok) {
          setError("Une erreur s'est produite" + (code ? " : " + translate(code) : ""));
          return false;
        } else {
          if (young.status === "REINSCRIPTION") plausibleEvent("Phase0/CTA representant legal - ID perimee - reinscription");
          else plausibleEvent("Phase0/CTA representant legal - ID perimee");
          history.push(`/representants-legaux/cni-invalide-done?token=${token}`);
        }
      } catch (e) {
        console.log(e);
        setError("Une erreur s'est produite" + (e.code ? " : " + translate(e.code) : ""));
      }
    } else {
      setError("Vous devez cocher la case pour valider votre déclaration.");
    }

    setSaving(false);
  }

  return (
    <>
      <div className="bg-white p-4 text-[#161616]">
        <div className="flex flex-col gap-4">
          <h1 className="text-[22px] font-bold">Déclaration sur l’honneur</h1>
          <div className="mt-2 text-[#161616]">
            Malheureusement, la pièce d’identité de <strong>{youngFullname}</strong> périme d’ici son départ en séjour de cohésion prévu le{" "}
            <strong className="whitespace-nowrap">{dateSejour}</strong>.
          </div>
          <Check checked={validated} onChange={(e) => setValidated(e)} className="mt-[32px]" error={error}>
            <div className="text-base text-[#161616]">
              Je, soussigné(e), <b>{parentFullname}</b>,
            </div>
            <div className="mt-2 text-sm text-[#3A3A3A]">
              Suis informé(e) que la participation au séjour de cohésion nécessite que mon enfant soit en possession d’une pièce d’identité valide et qu’à défaut, je dois sans
              retard engager les démarches de renouvellement de cette pièce d’identité.
            </div>
          </Check>
        </div>
      </div>
      <StickyButton onClick={onSubmit} disabled={saving} text="Valider ma déclaration" />
    </>
  );
}
