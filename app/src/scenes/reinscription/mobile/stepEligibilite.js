import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { getDepartmentByZip } from "snu-lib";
import validator from "validator";
import IconFrance from "../../../assets/IconFrance";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import Footer from "../../../components/footerV2";
import CheckBox from "../../../components/inscription/checkbox";
import Input from "../../../components/inscription/input";
import StickyButton from "../../../components/inscription/stickyButton";
import Toggle from "../../../components/inscription/toggle";
import SearchableSelect from "../../../components/SearchableSelect";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { translate } from "../../../utils";
import SchoolInFrance from "../../inscription2023/components/ShoolInFrance";
import SchoolOutOfFrance from "../../inscription2023/components/ShoolOutOfFrance";
import DatePickerList from "../../preinscription/components/DatePickerList";
import Navbar from "../components/Navbar";
import { STEPS } from "../utils/navigation";

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
      birthDate: data.birthDate,
    };

    try {
      const res = await api.post("/cohort-session/eligibility/2023", {
        department: data.school?.departmentName || data.school?.department || getDepartmentByZip(data.zip) || null,
        birthDate: data.birthDate,
        schoolLevel: data.scolarity,
        frenchNationality: data.frenchNationality,
      });
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

      updates.sessions = res.data;
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
      <div className="bg-white p-4">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Vérifiez votre éligibilité au SNU</h1>
          <a href="/public-besoin-d-aide/" target="_blank" rel="noreferrer">
            <QuestionMarkBlueCircle />
          </a>
        </div>
        <hr className="my-4 h-px bg-gray-200 border-0" />
        <div className="flex flex-col flex-start my-4">
          <div className="flex items-center">
            <CheckBox disabled={true} checked={data.frenchNationality === "true"} onChange={(e) => setData({ ...data, frenchNationality: e ? "true" : "false" })} />
            <div className="flex items-center backdrop-opacity-100">
              <span className="ml-2 mr-2 text-[#929292]">Je suis de nationalité française</span>
              {/* // ! J'arrive pas a griser le drapeau */}
              <IconFrance />
            </div>
          </div>
          {error.frenchNationality ? <span className="text-red-500 text-sm">{error.frenchNationality}</span> : null}
        </div>
        <div className="form-group">
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
        <div className="flex flex-col flex-start my-4 text-[#929292]">
          Date de naissance
          <DatePickerList disabled={true} value={data.birthDate} onChange={(date) => setData({ ...data, birthDate: date })} />
          {error.birthDate ? <span className="text-red-500 text-sm">{error.birthDate}</span> : null}
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

              <Toggle onClick={() => setData({ ...data, isAbroad: !data.isAbroad, zip: data.isAbroad ? null : data.zip })} toggled={!data.isAbroad} />
              {error.isAbroad ? <span className="text-red-500 text-sm">{error.isAbroad}</span> : null}
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
      </div>
      <Footer marginBottom={"mb-[88px]"} />
      <StickyButton text="Continuer" onClick={() => onSubmit()} disabled={loading} />
    </>
  );
}
