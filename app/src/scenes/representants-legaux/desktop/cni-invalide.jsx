import React, { useContext, useState, useEffect } from "react";
import { RepresentantsLegauxContext } from "../../../context/RepresentantsLegauxContextProvider";
import Check from "../components/Check";
import { COHESION_STAY_START, translate } from "snu-lib";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import Loader from "../../../components/Loader";
import { PlainButton } from "../components/Buttons";
import api from "../../../services/api";
import { API_DECLARATION_CNI_INVALIDE } from "../commons";
import { useHistory } from "react-router-dom";
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
    <div className="flex justify-center bg-[#f9f6f2] py-10">
      <div className="relative mx-auto my-0 basis-[70%] bg-white px-[102px] py-[60px] text-[#161616]">
        <h2 className="border-b-solid m-[0] mb-[32px] border-b-[1px] border-b-[#E5E5E5] pb-[32px] text-[24px] font-bold leading-[32px] text-[#161616]">
          Déclaration sur l’honneur
        </h2>
        <p>
          Malheureusement, la pièce d’identité de {youngFullname} périme d’ici son départ en séjour de cohésion prévu le {dateSejour}.
        </p>
        <Check checked={validated} onChange={(e) => setValidated(e)} className="mt-[32px]" error={error}>
          <p>
            Je, soussigné(e), <b>{parentFullname}</b>,
          </p>
          <p className="mt-2">
            Suis informé(e) que la participation au séjour de cohésion nécessite que mon enfant soit en possession d’une pièce d’identité valide et qu’à défaut, je dois sans retard
            engager les démarches de renouvellement de cette pièce d’identité.
          </p>
        </Check>
        <div className="border-t-solid mt-[32px] flex justify-end border-t-[1px] border-t-[#E5E5E5] pt-[32px]">
          <PlainButton onClick={onSubmit} spinner={saving}>
            Valider ma déclaration
          </PlainButton>
        </div>
      </div>
    </div>
  );
}
