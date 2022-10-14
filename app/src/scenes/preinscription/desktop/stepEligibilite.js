import React from "react";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { Link, useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import plausibleEvent from "../../../services/plausible";
import { capture } from "../../../sentry";
import { getDepartmentByZip } from "snu-lib";
import api from "../../../services/api";
import validator from "validator";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import CheckBox from "../../../components/inscription/CheckBox";
import IconFrance from "../../../assets/IconFrance";
import SearchableSelect from "../../../components/SearchableSelect";
import DatePickerList from "../components/DatePickerList";
import Toggle from "../../../components/inscription/toggle";
import SchoolInFrance from "../../inscription2023/components/ShoolInFrance";
import SchoolOutOfFrance from "../../inscription2023/components/ShoolOutOfFrance";
import Input from "../../../components/inscription/input";
import { PREINSCRIPTION_STEPS } from "../../../utils/navigation";

export default function StepEligibilite() {
  const [data, setData] = React.useContext(PreInscriptionContext);
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
          errors.school = "Vous devez choisir votre école";
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
      department: data.school?.departmentName || getDepartmentByZip(data.zip) || null,
      birthDate: new Date(data.birthDate),
      schoolLevel: data.scolarity,
      frenchNationality: data.frenchNationality,
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
    setData({ ...data, sessions: res.data, step: PREINSCRIPTION_STEPS.SEJOUR });
    return history.push("/preinscription/sejour");
  };

  return (
    <div className="bg-[#f9f6f2] flex justify-center py-10">
      <div className="bg-white basis-[70%] mx-auto my-0 px-[102px] py-[60px] drop-shadow-md">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-xl text-[#161616]">Vérifiez votre éligibilité au SNU</h1>
          <Link to="/public-besoin-d-aide/">
            <QuestionMarkBlueCircle />
          </Link>
        </div>
        <hr className="my-8 h-px bg-gray-200 border-0" />
        <div className="flex flex-col gap-5">
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
          <label className="flex flex-col flex-start text-base">
            Date de naissance
            <DatePickerList title="" value={data.birthDate} onChange={(e) => setData({ ...data, birthDate: e.target.value })} />
            {error.birthDate ? <span className="text-red-500 text-sm">{error.birthDate}</span> : null}
          </label>
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
                  <>
                    {error.school ? <span className="text-red-500 text-sm">{error.school}</span> : null}
                    <SchoolOutOfFrance school={data.school} onSelectSchool={(school) => setData({ ...data, school: school })} toggleVerify={toggleVerify} />
                  </>
                ) : (
                  <>
                    {error.school ? <span className="text-red-500 text-sm">{error.school}</span> : null}
                    <SchoolInFrance school={data.school} onSelectSchool={(school) => setData({ ...data, school: school })} toggleVerify={toggleVerify} />
                  </>
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
          <div className="flex justify-end gap-4">
            <button
              className="w-1/3 flex items-center justify-center px-3 py-2 cursor-pointer bg-[#000091] text-white hover:bg-white hover:!text-[#000091] hover:border hover:border-[#000091]"
              onClick={() => onSubmit()}
              disabled={loading}>
              Continuer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
