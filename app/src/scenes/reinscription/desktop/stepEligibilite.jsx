import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import Toggle from "../../../components/dsfr/forms/toggle";
import Input from "../../../components/dsfr/forms/input";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import { toastr } from "react-redux-toastr";
import IconFrance from "../../../assets/IconFrance";
import validator from "validator";
import plausibleEvent from "../../../services/plausible";
import SchoolOutOfFrance from "../../inscription2023/components/ShoolOutOfFrance";
import SchoolInFrance from "../../inscription2023/components/ShoolInFrance";
import SearchableSelect from "../../../components/dsfr/forms/SearchableSelect";
import CheckBox from "../../../components/dsfr/forms/checkbox";
import { useDispatch, useSelector } from "react-redux";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import DatePickerList from "../../../components/dsfr/forms/DatePickerList";
import { setYoung } from "../../../redux/auth/actions";
import { translate } from "../../../utils";

import { STEPS } from "../utils/navigation";
import Navbar from "../components/Navbar";

export default function StepEligibilite() {
  const [data, setData] = React.useState({});
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const [error, setError] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const [toggleVerify, setToggleVerify] = React.useState(false);

  const history = useHistory();

  useEffect(() => {
    if (!young) return;

    setData({
      frenchNationality: young.frenchNationality,
      birthDate: new Date(young.birthdateAt),
      school:
        young.reinscriptionStep2023 && young.reinscriptionStep2023 !== STEPS.ELIGIBILITE && young.schooled
          ? {
              fullName: young.schoolName,
              type: young.schoolType,
              adresse: young.schoolAddress,
              codeCity: young.schoolZip,
              city: young.schoolCity,
              departmentName: young.schoolDepartment,
              region: young.schoolRegion,
              country: young.schoolCountry,
              id: young.schoolId,
              postCode: young.schoolZip,
            }
          : null,
      scolarity: young.reinscriptionStep2023 && young.reinscriptionStep2023 !== STEPS.ELIGIBILITE ? young.grade : null,
      zip: young.zip,
    });
  }, [young]);

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
    plausibleEvent("Phase0/CTA reinscription - eligibilite");

    const updates = {
      grade: data.scolarity,
      schooled: data.school ? "true" : "false",
      schoolName: data.school?.fullName,
      schoolType: data.school?.type,
      schoolAddress: data.school?.address || data.school?.adresse,
      schoolZip: data.school?.postCode || data.school?.postcode,
      schoolCity: data.school?.city,
      schoolDepartment: data.school?.departmentName || data.school?.department,
      schoolRegion: data.school?.region,
      schoolCountry: data.school?.country,
      schoolId: data.school?.id,
      zip: data.zip,
      birthdateAt: data.birthDate,
    };

    try {
      const updatedYoung = { ...young, ...updates };
      const res = await api.post("/cohort-session/eligibility/2023", updatedYoung);
      if (!res.ok) {
        capture(res.code);
        setError({ text: "Impossible de vérifier votre éligibilité" });
        setLoading(false);
      }

      if (res.data.msg) {
        const res = await api.put("/young/reinscription/noneligible");
        if (!res.ok) {
          capture(res.code);
          setError({ text: "Pb avec votre non eligibilite" });
          setLoading(false);
        }
        dispatch(setYoung(res.data));
        return history.push("/reinscription/noneligible");
      }

      const sessionsFiltered = res.data.filter((e) => e.goalReached === false); //&& e.isFull === false --> voir si on le rajoute
      if (sessionsFiltered.length === 0) {
        setError({ text: "Il n'y a malheureusement plus de place dans votre département." });
        setLoading(false);
      }
      updates.sessions = sessionsFiltered;
    } catch (e) {
      capture(e);
      toastr.error("Une erreur s'est produite :", translate(e.code));
    }

    try {
      const { ok, code, data: responseData } = await api.put("/young/reinscription/eligibilite", updates);
      if (!ok) {
        setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
        setLoading(false);
        return;
      }
      dispatch(setYoung(responseData));
      return history.push("/reinscription/sejour");
    } catch (e) {
      capture(e);
      toastr.error("Une erreur s'est produite :", translate(e.code));
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex justify-center bg-[#f9f6f2] py-10">
        <div className="mx-auto my-0 basis-[70%] bg-white px-[102px] py-[60px] drop-shadow-md">
          <div className="flex w-full items-center justify-between">
            <h1 className="text-xl text-[#161616]">Vérifiez votre éligibilité au SNU</h1>
            <a href="/public-besoin-d-aide/" target="_blank" rel="noreferrer">
              <QuestionMarkBlueCircle />
            </a>
          </div>
          <hr className="my-8 h-px border-0 bg-gray-200" />
          <div className="flex flex-col gap-5">
            <div className="flex-start flex flex-col">
              <div className="flex items-center">
                <CheckBox disabled={true} checked={data.frenchNationality === "true"} onChange={(e) => setData({ ...data, frenchNationality: e ? "true" : "false" })} />
                <div className="flex items-center">
                  <span className="ml-4 mr-2 text-[#929292]">Je suis de nationalité française</span>
                  <IconFrance />
                </div>
              </div>
              {error.frenchNationality ? <span className="text-sm text-red-500">{error.frenchNationality}</span> : null}
            </div>
            <div className="flex w-full space-x-4">
              <div className="flex w-1/2 flex-col">
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
              <label className="flex-start mt-2 flex w-1/2 flex-col text-base text-[#929292]">
                Date de naissance
                <DatePickerList disabled={true} value={data.birthDate} onChange={(date) => setData({ ...data, birthDate: date })} />
                {error.birthDate ? <span className="text-sm text-red-500">{error.birthDate}</span> : null}
              </label>
            </div>
            {data.scolarity && (
              <>
                <div className="flex items-center justify-between">
                  <p>
                    <div>
                      <span className="font-bold">{data.scolarity === "NOT_SCOLARISE" ? "Je réside" : "Mon établissement scolaire est"}</span> en France
                    </div>
                    <div className="flex h-5 items-center">
                      <span className="text-xs leading-5 text-[#666666]">Métropolitaine ou Outre-mer</span>
                    </div>
                  </p>

                  <Toggle onClick={() => setData({ ...data, isAbroad: !data.isAbroad, zip: data.isAbroad ? null : data.zip })} toggled={!data.isAbroad} />
                  {error.isAbroad ? <span className="text-sm text-red-500">{error.isAbroad}</span> : null}
                </div>

                {data.scolarity !== "NOT_SCOLARISE" ? (
                  data.isAbroad ? (
                    <>
                      <SchoolOutOfFrance school={data.school} onSelectSchool={(school) => setData({ ...data, school: school })} toggleVerify={toggleVerify} />
                    </>
                  ) : (
                    <>
                      <SchoolInFrance school={data.school} onSelectSchool={(school) => setData({ ...data, school: school })} toggleVerify={toggleVerify} />
                    </>
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
            <div className="flex justify-end gap-4">
              <button
                className="flex w-1/3 cursor-pointer items-center justify-center bg-[#000091] px-3 py-2 text-white hover:border hover:border-[#000091] hover:bg-white hover:!text-[#000091]"
                onClick={() => onSubmit()}
                disabled={loading}>
                Continuer
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
