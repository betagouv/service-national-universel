import React from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { ReinscriptionContext } from "../../../context/ReinscriptionContextProvider";
import { capture } from "../../../sentry";
import validator from "validator";
import dayjs from "dayjs";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { PREINSCRIPTION_STEPS, REINSCRIPTION_STEPS } from "../../../utils/navigation";
import { PaddedContainer } from "@snu/ds/dsfr";

import IconFrance from "../../../assets/IconFrance";
import School from "../../../assets/school.png";
import Input from "../../../components/dsfr/forms/input";
import Toggle from "../../../components/dsfr/forms/toggle";
import SearchableSelect from "../../../components/dsfr/forms/SearchableSelect";
import SchoolInFrance from "../../inscription2023/components/ShoolInFrance";
import SchoolOutOfFrance from "../../inscription2023/components/ShoolOutOfFrance";
import DatePicker from "../../../components/dsfr/forms/DatePicker";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import ProgressBar from "../components/ProgressBar";
import { supportURL } from "@/config";
import { validateBirthDate } from "@/scenes/inscription2023/utils";
import { SignupButtons, Checkbox } from "@snu/ds/dsfr";

export default function StepEligibilite() {
  const isLoggedIn = !!useSelector((state) => state?.Auth?.young);
  const [STEPS, context, isBirthdayModificationDisabled, uri, bdcUri] = isLoggedIn
    ? [REINSCRIPTION_STEPS, ReinscriptionContext, true, "reinscription", "jetais-inscrit-en-2023-comment-me-reinscrire-en-2024"]
    : [PREINSCRIPTION_STEPS, PreInscriptionContext, false, "preinscription", "je-me-preinscris-et-cree-mon-compte-volontaire"];
  const [data, setData] = React.useContext(context);
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
    { value: "1ereCAP", label: "CAP 1ère année" },
    { value: "2ndeCAP", label: "CAP 2ème année" },
    { value: "Autre", label: "Scolarisé(e) (autre niveau)" },
  ];

  const onVerify = async () => {
    let errors = {};

    if (data.frenchNationality === "false" || !data.frenchNationality) {
      errors.frenchNationality = "Pour participer au SNU, vous devez être de nationalité française.";
    }

    // Scolarity
    if (!data?.scolarity) {
      errors.scolarity = "Choisissez un niveau de scolarité";
    }
    // Birthdate
    if (!data?.birthDate || !validateBirthDate(data?.birthDate)) {
      errors.birthDate = "Vous devez saisir une date de naissance valide";
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
        if (!validateSchool(data)) {
          // Permet de rentrer dans la gestion d'erreur et ne pas valider le formulaire
          errors.school = "Vous devez renseigner complètement votre établissement scolaire";
        }
      }
    }
    function validateSchool(data) {
      if (data.isAbroad) {
        if (!data?.school?.fullName) return false;
        if (!data?.school?.country) return false;
        return true;
      } else {
        if (!data?.school?.fullName) return false;
        if (!data?.school?.city) return false;
        if (!data?.school?.postCode && !data?.school?.postcode && !data?.school?.zip && !data?.school?.codePays) return false;
        return true;
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

    onSubmit();
  };

  const onSubmit = async () => {
    // Check if young is more than 17 years old
    const age = dayjs().diff(dayjs(data.birthDate), "year");
    if (age > 17) {
      if (!isLoggedIn) {
        setData({ ...data, message: "age", step: PREINSCRIPTION_STEPS.INELIGIBLE });
        return history.push("/preinscription/noneligible");
      } else {
        const { ok, code } = await api.put("/young/reinscription/not-eligible");
        if (!ok) {
          capture(new Error(code));
          setError({ text: "Impossible de vérifier votre éligibilité" });
          return;
        }
        // setData({ ...data, message: "age", step: REINSCRIPTION_STEPS.INELIGIBLE });
        return history.push("/noneligible");
      }
    }

    setLoading(true);
    plausibleEvent(`Phase0/CTA ${uri}- eligibilite`);
    if (data.frenchNationality === "false") {
      setData({ ...data, msg: "Pour participer au SNU, vous devez être de nationalité française." });
      return history.push(`/${uri}/noneligible`);
    }
    const {
      ok,
      code,
      data: sessions,
      message,
    } = await api.post(`/preinscription/eligibilite`, {
      schoolDepartment: data.school?.departmentName,
      department: data.school?.department,
      schoolRegion: data.school?.region,
      birthdateAt: dayjs(data.birthDate).locale("fr").format("YYYY-MM-DD"),
      grade: data.scolarity,
      zip: data.zip,
      isReInscription: !!data.isReInscription,
    });

    if (!ok) {
      capture(new Error(code));
      setError({ text: "Impossible de vérifier votre éligibilité" });
      setLoading(false);
    }

    if (sessions.length === 0) {
      setData({ ...data, message, step: STEPS.NO_SEJOUR });
      return history.push(`/${uri}/no_sejour`);
    }

    setData({ ...data, sessions, step: STEPS.SEJOUR });
    return history.push(`/${uri}/sejour`);
  };

  return (
    <>
      <ProgressBar isReinscription={isLoggedIn} />
      {!isLoggedIn && (
        <PaddedContainer className="flex py-4 sm:flex-row-reverse md:flex-row">
          <div className="pt-3 md:pr-4 sm:w-80 md:w-40">
            <img src={School} alt="" />
          </div>
          <div>
            <p className="mb-2 text-xl font-bold">Classes engagées</p>
            <p className="text-sm sm:mr-4 md:mr-0">
              Si vous envisagez une participation au SNU dans le cadre des classes engagées, vous ne pouvez pas vous inscrire ici. Veuillez attendre que votre référent classe vous
              indique la procédure à suivre.
            </p>
            <a
              className="text-sm text-[#000091]"
              rel="noreferrer noopener"
              target="blank"
              href={`${supportURL}/base-de-connaissance/je-suis-volontaire-classes-engagees-comment-minscrire`}>
              En savoir plus →
            </a>
          </div>
        </PaddedContainer>
      )}
      <DSFRContainer title="Vérifiez votre éligibilité au SNU" supportLink={`${supportURL}/base-de-connaissance/${bdcUri}`} supportEvent={`Phase0/aide ${uri} - eligibilite`}>
        <div className="space-y-5">
          {!isLoggedIn && (
            <Checkbox
              state={error.frenchNationality && "error"}
              stateRelatedMessage={error.frenchNationality}
              options={[
                {
                  label: (
                    <span className="flex items-center">
                      <span className="mr-2">Je suis de nationalité française</span> <IconFrance />
                    </span>
                  ),
                  nativeInputProps: {
                    checked: data.frenchNationality === "true",
                    onChange: (e) => setData({ ...data, frenchNationality: e.target.checked ? "true" : "false" }),
                  },
                },
              ]}
            />
          )}
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
            <label className={`flex-start mt-2 flex w-full flex-col text-base ${isBirthdayModificationDisabled ? "text-[#929292]" : "text-[#161616]"}`}>
              Date de naissance
              <DatePicker
                initialValue={new Date(data.birthDate)}
                onChange={(date) => setData({ ...data, birthDate: date })}
                disabled={isBirthdayModificationDisabled}
                state={error.birthDate ? "error" : "default"}
              />
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

                <Toggle onClick={() => setData({ ...data, isAbroad: !data.isAbroad, school: {}, zip: undefined })} toggled={!data.isAbroad} />
                {error.isAbroad ? <span className="text-sm text-red-500">{error.isAbroad}</span> : null}
              </div>

              {data.scolarity !== "NOT_SCOLARISE" ? (
                data.isAbroad ? (
                  <SchoolOutOfFrance school={data.school} onSelectSchool={(school) => setData({ ...data, school: school })} toggleVerify={toggleVerify} />
                ) : (
                  <SchoolInFrance school={data.school} onSelectSchool={(school) => setData({ ...data, school: school })} errors={error} />
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
          <SignupButtons onClickNext={onVerify} disabled={loading} />
        </div>
      </DSFRContainer>
    </>
  );
}
