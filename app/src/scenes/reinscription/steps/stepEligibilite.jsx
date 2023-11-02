import React from "react";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { ReinscriptionContext } from "../../../context/ReinscriptionContextProvider";
import { capture } from "../../../sentry";
import validator from "validator";
import dayjs from "dayjs";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { useDispatch } from "react-redux";
import { REINSCRIPTION_STEPS } from "../../../utils/navigation";

import Input from "../../../components/dsfr/forms/input";
import Toggle from "../../../components/dsfr/forms/toggle";
import SearchableSelect from "../../../components/dsfr/forms/SearchableSelect";
import SchoolInFrance from "../../inscription2023/components/ShoolInFrance";
import SchoolOutOfFrance from "../../inscription2023/components/ShoolOutOfFrance";
import DatePicker from "../../../components/dsfr/forms/DatePicker";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import SignupButtonContainer from "../../../components/dsfr/ui/buttons/SignupButtonContainer";
import ProgressBar from "../components/ProgressBar";
import { supportURL } from "@/config";
import { setYoung } from "@/redux/auth/actions";

export default function StepEligibilite() {
  const [data, setData] = React.useContext(ReinscriptionContext);
  const [error, setError] = React.useState({});
  const [toggleVerify, setToggleVerify] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const isBirthdayModificationDisabled = true;
  const dispatch = useDispatch();
  const history = useHistory();
  const isEmptyObject = (obj) => {
    if (!obj) return true; // Retourne true si l'objet est null ou undefined
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  };

  const optionsScolarite = [
    { value: "NOT_SCOLARISE", label: "Non scolarisé(e)" },
    { value: "4eme", label: "4ème" },
    { value: "3eme", label: "3ème" },
    { value: "2ndePro", label: "2de professionnelle" },
    { value: "2ndeGT", label: "2de générale et technologique" },
    { value: "1erePro", label: "1ère professionnelle" },
    { value: "1ereGT", label: "1ère générale et technologique" },
    { value: "TermPro", label: "Terminale professionnelle" },
    { value: "TermGT", label: "Terminale générale et technologique" },
    { value: "CAP", label: "CAP" },
    { value: "Autre", label: "Scolarisé(e) (autre niveau)" },
  ];

  const onSubmit = async () => {
    let errors = {};

    // Scolarity
    if (!data?.scolarity) {
      errors.scolarity = "Choisissez un niveau de scolarité";
    }

    if (data.scolarity) {
      if (data.scolarity === "NOT_SCOLARISE") {
        // Zip du jeune
        // ! Vérifie que ça a la bouille d'un zipcode mais ds les faits, on peut mettre nimp en 5 chiffres
        if (!(data?.zip && validator.isPostalCode(data?.zip, "FR"))) {
          errors.zip = "Vous devez sélectionner un code postal";
        }
      } else {
        // School
        if (isEmptyObject(data?.school)) {
          // Permet de rentrer dans la gestion d'erreur et ne pas valider le formulaire
          errors.school = "Vous devez renseigner complètement votre établissement scolaire";
        }
      }
    }

    setError(errors);
    setToggleVerify(!toggleVerify);

    if (Object.keys(errors).length) {
      console.warn("Pb avec ce champ : " + Object.keys(errors)[0] + " pour la raison : " + Object.values(errors)[0]);
      toastr.error("Un problème est survenu : Vérifiez que vous avez rempli tous les champs");
      return;
    }

    setLoading(true);
    plausibleEvent("Phase0/CTA reinscription - eligibilite");

    try {
      const res = await api.post(`/cohort-session/eligibility/2023?timeZoneOffset=${new Date().getTimezoneOffset()}`, {
        schoolDepartment: data.school?.departmentName,
        department: data.school?.department,
        schoolRegion: data.school?.region,
        birthdateAt: dayjs(data.birthDate).locale("fr").format("YYYY-MM-DD"),
        grade: data.scolarity,
        zip: data.zip,
      });
      if (!res.ok) {
        capture(res.code);
        setError({ text: "Impossible de vérifier votre éligibilité" });
        setLoading(false);
        return;
      }

      if (res.data.msg || res.data.length === 0) {
        const { ok, data, code } = await api.put("/young/reinscription/not-eligible");
        if (!ok) {
          capture(code);
          setError({ text: "Impossible de vérifier votre éligibilité" });
          setLoading(false);
          return;
        }
        dispatch(setYoung(data));
        setData({ ...data, step: REINSCRIPTION_STEPS.INELIGIBLE });
        return history.push("/reinscription/noneligible");
      }

      const { ok, code } = await api.put("/young/reinscription", { step: REINSCRIPTION_STEPS.SEJOUR });
      const sessions = res.data;
      setData({ ...data, sessions, step: REINSCRIPTION_STEPS.SEJOUR });
      if (!ok) {
        capture(code);
        setError({ text: "Impossible de vérifier votre éligibilité" });
        setLoading(false);
        return;
      }
      return history.push("/reinscription/sejour");
    } catch (error) {
      capture(error);
      setError({ text: "Impossible de vérifier votre éligibilité" });
      setLoading(false);
    }
  };

  return (
    <>
      <ProgressBar />
      <DSFRContainer title="Vérifiez votre éligibilité au SNU" supportLink={supportURL + "/base-de-connaissance/jetais-inscrit-en-2023-comment-me-reinscrire-en-2024"}>
        <div className="space-y-5">
          <div className="flex flex-col gap-4">
            <div className="flex w-full flex-col">
              <SearchableSelect
                label="Niveau de scolarité"
                value={data.scolarity}
                options={optionsScolarite}
                onChange={(value) => {
                  setData({ ...data, scolarity: value, school: value === "NOT_SCOLARISE" ? null : data.school });
                }}
                placeholder="Sélectionnez une option"
              />
              {error.scolarity ? <span className="text-sm text-red-500">{error.scolarity}</span> : null}
            </div>
            <label className={`flex-start mt-2 flex w-full flex-col text-base ${isBirthdayModificationDisabled ? "text-[#929292]" : "text-[#666666]"}`}>
              Date de naissance
              <DatePicker value={new Date(data.birthDate)} onChange={(date) => setData({ ...data, birthDate: date })} disabled={isBirthdayModificationDisabled} />
              {error.birthDate ? <span className="text-sm text-red-500">{error.birthDate}</span> : null}
            </label>
          </div>

          {data.scolarity && (
            <>
              <div className="flex items-center justify-between">
                <p className="flex flex-col">
                  <span>
                    <span className="font-bold">{data.scolarity === "NOT_SCOLARISE" ? "Je réside" : "Mon établissement scolaire est"}</span> en France
                  </span>
                  <span className="flex h-5 items-center">
                    <span className="text-xs leading-5 text-[#666666]">Métropolitaine ou Outre-mer</span>
                  </span>
                </p>

                <Toggle onClick={() => setData({ ...data, isAbroad: !data.isAbroad, school: {} })} toggled={!data.isAbroad} />
                {error.isAbroad ? <span className="text-sm text-red-500">{error.isAbroad}</span> : null}
              </div>

              {data.scolarity !== "NOT_SCOLARISE" ? (
                data.isAbroad ? (
                  <SchoolOutOfFrance school={data.school} onSelectSchool={(school) => setData({ ...data, school: school })} toggleVerify={toggleVerify} />
                ) : (
                  <SchoolInFrance school={data.school} onSelectSchool={(school) => setData({ ...data, school: school })} toggleVerify={toggleVerify} />
                )
              ) : !data.isAbroad ? (
                <div className="flex-start my-4 flex flex-col">
                  Code Postal
                  <div className="flex h-5 items-center">
                    <span className="text-xs leading-5 text-[#666666]">Exemple : 75008</span>
                  </div>
                  <Input value={data.zip} onChange={(e) => setData({ ...data, zip: e })} />
                  {error.zip ? <span className="text-sm text-red-500">{error.zip}</span> : null}
                </div>
              ) : null}
            </>
          )}
          <SignupButtonContainer onClickNext={onSubmit} disabled={loading} />
        </div>
      </DSFRContainer>
    </>
  );
}
