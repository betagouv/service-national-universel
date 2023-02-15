import React from "react";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { capture } from "../../../sentry";
import validator from "validator";
import dayjs from "dayjs";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { PREINSCRIPTION_STEPS } from "../../../utils/navigation";

import IconFrance from "../../../assets/IconFrance";
import CheckBox from "../../../components/inscription/checkbox";
import Input from "../../../components/inscription/input";
import Toggle from "../../../components/inscription/toggle";
import SearchableSelect from "../../../components/SearchableSelect";
import SchoolInFrance from "../../inscription2023/components/ShoolInFrance";
import SchoolOutOfFrance from "../../inscription2023/components/ShoolOutOfFrance";
import DatePickerList from "../components/DatePickerList";
import SignupContainer from "../../../components/SignupContainer";
import SignupButtonContainer from "../../../components/SignupButtonContainer";

export default function StepEligibilite() {
  const [data, setData] = React.useContext(PreInscriptionContext);
  console.log("🚀 ~ file: stepEligibilite.js:25 ~ StepEligibilite ~ data", data);
  const [error, setError] = React.useState({});
  const [toggleVerify, setToggleVerify] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const history = useHistory();

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

    // Nationality
    if (!data?.frenchNationality) {
      errors.frenchNationality = "Vous devez être français";
    }
    // Scolarity
    if (!data?.scolarity) {
      errors.scolarity = "Choisissez un niveau de scolarité";
    }
    // Birthdate
    // ? Check age ?
    if (!data?.birthDate) {
      errors.birthDate = "Vous devez choisir une date de naissance";
    }

    if (data.scolarity) {
      if (data.scolarity === "NOT_SCOLARISE") {
        // Zip du jeune
        // ! Vérifie que ça a la bouille d'un zipcode mais ds les faits, on peut mettre nimp en 5 chiffres
        if (!data?.isAbroad && !(data?.zip && validator.isPostalCode(data?.zip, "FR"))) {
          errors.zip = "Vous devez sélectionner un code postal";
        }
      } else {
        // School
        if (!data?.school) {
          // Permet de rentrer dans la gestion d'erreur et ne pas valider le formulaire
          errors.school = "Vous devez renseigner complètement votre établissement scolaire";
        }
      }
    }

    setError(errors);
    setToggleVerify(!toggleVerify);

    // ! Gestion erreur a reprendre
    if (Object.keys(errors).length) {
      console.warn("Pb avec ce champ : " + Object.keys(errors)[0] + " pour la raison : " + Object.values(errors)[0]);
      toastr.error("Un problème est survenu : Vérifiez que vous avez rempli tous les champs");
      return;
    }

    setLoading(true);
    plausibleEvent("Phase0/CTA preinscription - eligibilite");
    if (data.frenchNationality === "false") {
      setData({ ...data, msg: "Pour participer au SNU, vous devez être de nationalité française." });
      return history.push("/preinscription/noneligible");
    }
    const res = await api.post("/cohort-session/eligibility/2023", {
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
    }
    if (res.data.msg) {
      setData({ ...data, msg: res.data.msg, step: PREINSCRIPTION_STEPS.INELIGIBLE });
      return history.push("/preinscription/noneligible");
    }
    const sessionsFiltered = res.data.filter((e) => e.goalReached === false); //&& e.isFull === false --> voir si on le rajoute
    if (sessionsFiltered.length === 0) {
      setData({ ...data, msg: "Il n'y a malheureusement plus de place dans votre département.", step: PREINSCRIPTION_STEPS.INELIGIBLE });
      return history.push("/preinscription/noneligible");
    }
    setData({ ...data, sessions: sessionsFiltered, step: PREINSCRIPTION_STEPS.SEJOUR });
    return history.push("/preinscription/sejour");
  };

  return (
    <SignupContainer title="Vérifiez votre éligibilité au SNU" showHelp={false}>
      <div className="space-y-5">
        <div className="flex flex-col flex-start">
          <div className="flex items-center">
            <CheckBox checked={data.frenchNationality === "true"} onChange={(e) => setData({ ...data, frenchNationality: e ? "true" : "false" })} />
            <div className="flex items-center">
              <span className="ml-4 mr-2">Je suis de nationalité française</span>
              <IconFrance />
            </div>
          </div>
          {error.frenchNationality ? <span className="text-red-500 text-sm">{error.frenchNationality}</span> : null}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex flex-col">
            <SearchableSelect
              label="Niveau de scolarité"
              value={data.scolarity}
              options={optionsScolarite}
              onChange={(value) => {
                setData({ ...data, scolarity: value, school: value === "NOT_SCOLARISE" ? null : data.school });
              }}
              placeholder="Sélectionnez une option"
            />
            {error.scolarity ? <span className="text-red-500 text-sm">{error.scolarity}</span> : null}
          </div>
          <label className="flex flex-col flex-start text-base mt-2">
            Date de naissance
            <DatePickerList value={data.birthDate} onChange={(date) => setData({ ...data, birthDate: date })} />
            {error.birthDate ? <span className="text-red-500 text-sm">{error.birthDate}</span> : null}
          </label>
        </div>

        {data.scolarity && (
          <>
            <div className="flex justify-between items-center">
              <p>
                <div>
                  <span className="font-bold">{data.scolarity === "NOT_SCOLARISE" ? "Je réside" : "Mon établissement scolaire est"}</span> en France
                </div>
                <div className="h-5 flex items-center">
                  <span className="text-xs leading-5 text-[#666666]">Métropolitaine ou Outre-mer</span>
                </div>
              </p>

              <Toggle onClick={() => setData({ ...data, isAbroad: !data.isAbroad })} toggled={!data.isAbroad} />
              {error.isAbroad ? <span className="text-red-500 text-sm">{error.isAbroad}</span> : null}
            </div>

            {data.scolarity !== "NOT_SCOLARISE" ? (
              data.isAbroad ? (
                <SchoolOutOfFrance school={data.school} onSelectSchool={(school) => setData({ ...data, school: school })} toggleVerify={toggleVerify} />
              ) : (
                <SchoolInFrance school={data.school} onSelectSchool={(school) => setData({ ...data, school: school })} toggleVerify={toggleVerify} />
              )
            ) : !data.isAbroad ? (
              <div className="flex flex-col flex-start my-4">
                Code Postal
                <div className="h-5 flex items-center">
                  <span className="text-xs leading-5 text-[#666666]">Exemple : 75008</span>
                </div>
                <Input value={data.zip} onChange={(e) => setData({ ...data, zip: e })} />
                {error.zip ? <span className="text-red-500 text-sm">{error.zip}</span> : null}
              </div>
            ) : null}
          </>
        )}

        <SignupButtonContainer onClick={onSubmit} disabled={loading} />
      </div>
    </SignupContainer>
  );
}
