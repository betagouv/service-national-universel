import React from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import { ReinscriptionContext } from "../../../context/ReinscriptionContextProvider";
import { capture } from "../../../sentry";
import validator from "validator";
import dayjs from "dayjs";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { PREINSCRIPTION_STEPS, REINSCRIPTION_STEPS } from "../../../utils/navigation";
import { Container } from "@snu/ds/dsfr";

import IconFrance from "../../../assets/IconFrance";
import School from "../../../assets/school.png";
import Input from "../../../components/dsfr/forms/input";
import Toggle from "../../../components/dsfr/forms/toggle";
import SearchableSelect from "../../../components/dsfr/forms/SearchableSelect";
import SchoolInFrance from "../../inscription2023/components/ShoolInFrance";
import SchoolOutOfFrance from "../../inscription2023/components/ShoolOutOfFrance";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import ProgressBar from "../components/ProgressBar";
import { environment, supportURL } from "@/config";
import { SignupButtons, Checkbox } from "@snu/ds/dsfr";
import ErrorComponent from "@/components/error";
import { FEATURES_NAME, isFeatureEnabled } from "snu-lib";

export default function StepEligibilite() {
  const isLoggedIn = !!useSelector((state) => state?.Auth?.young);
  const [STEPS, context, isBirthdayModificationDisabled, uri, bdcUri] = isLoggedIn
    ? [REINSCRIPTION_STEPS, ReinscriptionContext, true, "reinscription", "jetais-inscrit-en-2023-2024-comment-me-reinscrire-en-2024-2025"]
    : [PREINSCRIPTION_STEPS, PreInscriptionContext, false, "preinscription", "je-me-preinscris-et-cree-mon-compte-volontaire"];
  const [data, setData] = React.useContext(context);
  const [error, setError] = React.useState({});
  const [fetchError, setFetchError] = React.useState("");
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

  function validateForm() {
    let errors = {};

    if (data.frenchNationality === "false" || !data.frenchNationality) {
      errors.frenchNationality = "Pour participer au SNU, vous devez être de nationalité française.";
    }

    // Scolarity
    if (!data?.scolarity) {
      errors.scolarity = "Choisissez un niveau de scolarité";
    }
    // Birthdate
    if (!isLoggedIn) {
      // Don't validate date for reinscription
      if (!data?.day || data?.day < 1 || data?.day > 31) {
        errors.day = "Vous devez saisir un jour valide";
      }
      if (!data?.month || data?.month < 1 || data?.month > 12) {
        errors.month = "Vous devez saisir un mois valide";
      }
      if (!data?.year || data?.year < 2000 || data?.year > new Date().getFullYear()) {
        errors.year = "Vous devez saisir une année valide";
      }
    }

    if (data.scolarity) {
      if (data.scolarity === "NOT_SCOLARISE") {
        // Zip du jeune
        // ! Vérifie que ça a la bouille d'un zipcode mais ds les faits, on peut mettre nimp en 5 chiffres
        if (!data?.isAbroad && !(data?.zip && validator.isPostalCode(data?.zip, "FR"))) {
          errors.zip = "Vous devez saisir un code postal";
        }
      } else {
        // School
        if (!validateSchool(data)) {
          // Permet de rentrer dans la gestion d'erreur et ne pas valider le formulaire
          errors.school = "Vous devez renseigner complètement votre établissement scolaire";
        }
      }
    }

    return errors;
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

  const handleSubmit = async () => {
    plausibleEvent(`Phase0/CTA ${uri}- eligibilite`);
    if (isFeatureEnabled(FEATURES_NAME.API_ENG_TRACKING, undefined, environment)) {
      window.apieng && window.apieng("trackAccount");
    }

    const errors = validateForm();

    if (Object.values(errors).length) {
      setError(errors);
      setToggleVerify(!toggleVerify);
      return;
    }

    if (!isLoggedIn) {
      data.birthDate = new Date(data.year, data.month - 1, data.day);
    }

    // Check if young is more than 17 years old
    const age = dayjs().diff(dayjs(data.birthDate), "year");
    if (age > 17) {
      if (!isLoggedIn) {
        // Preinscription
        setData({ ...data, message: "age", step: PREINSCRIPTION_STEPS.INELIGIBLE });
        return history.push("/preinscription/noneligible");
      } else {
        // Reinscription
        const { ok, code } = await api.put("/young/reinscription/not-eligible");
        if (!ok) {
          capture(new Error(code));
          setFetchError({ text: "Impossible de vérifier votre éligibilité" });
          return;
        }
        // setData({ ...data, message: "age", step: REINSCRIPTION_STEPS.INELIGIBLE });
        return history.push("/noneligible");
      }
    }

    if (data.frenchNationality === "false") {
      setData({ ...data, msg: "Pour participer au SNU, vous devez être de nationalité française." });
      return history.push(`/${uri}/noneligible`);
    }

    setLoading(true);

    try {
      const { data: sessions, message } = await api.post(`/preinscription/eligibilite`, {
        schoolDepartment: data.school?.departmentName || data.school?.department,
        department: data.department,
        schoolRegion: data.school?.region,
        birthdateAt: data.birthDate,
        grade: data.scolarity,
        zip: data.zip,
        isReInscription: !!data.isReInscription,
      });

      if (sessions.length === 0) {
        setData({ ...data, message, step: STEPS.NO_SEJOUR });
        return history.push(`/${uri}/no_sejour`);
      }

      setData({ ...data, sessions, step: STEPS.SEJOUR });
      return history.push(`/${uri}/sejour`);
    } catch (e) {
      capture(e);
      setFetchError({
        text: "Impossible de vérifier votre éligibilité",
        subText: "Veuillez réessayer plus tard",
      });
      setLoading(false);
    }
  };

  const blockInvalidChar = (e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault();

  return (
    <>
      <ProgressBar isReinscription={isLoggedIn} />
      {!isLoggedIn && (
        <Container className="py-[12px] px-[20px] md:pl-[40px] md:pr-[80px] md:py-[30px] flex md:flex-row-reverse gap-5 md:gap-8 border-b md:border-none">
          <div>
            <p className="m-0 text-xl font-bold">Classes engagées</p>
            <p className="m-0 text-sm sm:mr-4 md:mr-0">
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
          <div className="flex-none w-16 md:w-auto">
            <img src={School} alt="" className="md:w-20" />
          </div>
        </Container>
      )}
      <DSFRContainer title="Vérifiez votre éligibilité au SNU" supportLink={`${supportURL}/base-de-connaissance/${bdcUri}`} supportEvent={`Phase0/aide ${uri} - eligibilite`}>
        <div className="space-y-5">
          {fetchError && <ErrorComponent text={fetchError.text} subText={fetchError.subText} onClose={() => setFetchError("")} />}

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

            <label className="mt-2">
              Date de naissance
              <div className="grid grid-cols-3 gap-4">
                <Input
                  id="day"
                  type="number"
                  min="1"
                  max="31"
                  value={isLoggedIn ? dayjs(data.birthDate).format("DD") : data.day}
                  onKeyDown={blockInvalidChar}
                  onChange={(e) => setData({ ...data, day: e })}
                  placeholder="Jour"
                  hintText="Exemple : 14"
                  maxLength="2"
                  disabled={isBirthdayModificationDisabled}
                  state={error.day ? "error" : "default"}
                  stateRelatedMessage={error.day}
                />
                <Input
                  id="month"
                  type="number"
                  min="1"
                  max="12"
                  value={isLoggedIn ? dayjs(data.birthDate).format("MM") : data.month}
                  onKeyDown={blockInvalidChar}
                  onChange={(e) => setData({ ...data, month: e })}
                  placeholder="Mois"
                  hintText="Exemple : 12"
                  maxLength="2"
                  disabled={isBirthdayModificationDisabled}
                  state={error.month ? "error" : "default"}
                  stateRelatedMessage={error.month}
                />
                <Input
                  id="year"
                  type="number"
                  min="2000"
                  max={new Date().getFullYear()}
                  value={isLoggedIn ? dayjs(data.birthDate).format("YYYY") : data.year}
                  onKeyDown={blockInvalidChar}
                  onChange={(e) => setData({ ...data, year: e })}
                  placeholder="Année"
                  hintText="Exemple : 2004"
                  maxLength="4"
                  disabled={isBirthdayModificationDisabled}
                  state={error.year ? "error" : "default"}
                  stateRelatedMessage={error.year}
                />
              </div>
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
          <SignupButtons onClickNext={handleSubmit} disabled={loading} />
        </div>
      </DSFRContainer>
    </>
  );
}
