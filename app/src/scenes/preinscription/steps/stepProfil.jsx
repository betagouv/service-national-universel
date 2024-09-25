import React from "react";
import { useHistory } from "react-router-dom";
import validator from "validator";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import Input from "../../../components/dsfr/forms/input";
import { appURL, environment, supportURL } from "../../../config";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import plausibleEvent from "../../../services/plausible";
import { getPasswordErrorMessage } from "../../../utils";
import { PREINSCRIPTION_STEPS } from "../../../utils/navigation";
import ProgressBar from "../components/ProgressBar";
import { PHONE_ZONES, isPhoneNumberWellFormated, FEATURES_NAME, isFeatureEnabled, translate, YOUNG_SOURCE, translateGrade } from "snu-lib";
import ErrorMessage from "@/components/dsfr/forms/ErrorMessage";
import IconFrance from "@/assets/IconFrance";
import DatePicker from "@/components/dsfr/forms/DatePicker";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import ReactTooltip from "react-tooltip";
import dayjs from "dayjs";
import API from "@/services/api";
import { setYoung } from "@/redux/auth/actions";
import { capture } from "@/sentry";
import { RiInformationLine } from "react-icons/ri";
import { validateBirthDate } from "@/scenes/inscription2023/utils";
import { SignupButtons, InputPassword, InputPhone, Checkbox } from "@snu/ds/dsfr";
import SearchableSelect from "@/components/dsfr/forms/SearchableSelect";
import { cohortsInit } from "@/utils/cohorts";

export default function StepProfil() {
  const [data, setData] = React.useContext(PreInscriptionContext);
  const [error, setError] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const keyList = ["firstName", "lastName", "phone", "phoneZone", "email", "emailConfirm", "password", "confirmPassword"];
  const history = useHistory();
  const dispatch = useDispatch();
  const parcours = new URLSearchParams(window.location.search).get("parcours")?.toUpperCase();
  const isCLE = parcours === YOUNG_SOURCE.CLE;
  const classeId = new URLSearchParams(window.location.search).get("classeId");

  const optionsScolarite = [
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

  const trimmedPhone = data?.phone?.replace(/\s/g, "");
  const trimmedEmail = data?.email?.trim();
  const trimmedEmailConfirm = data?.emailConfirm?.trim();

  const handleNameChange = (field) => (value) => {
    const regex = /[^a-zA-ZÀ-ÿ\s'-]/g;
    const newValue = value.replace(regex, "");
    setData({ ...data, [field]: newValue });
  };

  const validate = () => {
    let errors = {};

    if (isCLE && !data?.frenchNationality) {
      errors.frenchNationality = "Ce champ est obligatoire";
    }
    if (isCLE && !data?.grade) {
      errors.grade = "Ce champ est obligatoire";
    }
    if (isCLE && (!data?.birthDate || !validateBirthDate(data?.birthDate))) {
      errors.birthDate = "Vous devez saisir une date de naissance valide";
    }
    if (data?.phone && !isPhoneNumberWellFormated(trimmedPhone, data?.phoneZone)) {
      errors.phone = PHONE_ZONES[data?.phoneZone]?.errorMessage;
    }

    // Email
    if (trimmedEmail && !validator.isEmail(trimmedEmail)) {
      errors.email = "L'e-mail renseigné est invalide";
    }
    // Email confirm
    if (trimmedEmail && trimmedEmailConfirm && trimmedEmail !== trimmedEmailConfirm) {
      errors.emailConfirm = "Les emails ne correspondent pas";
    }
    // Password
    if (data?.password && getPasswordErrorMessage(data?.password)) {
      errors.password = getPasswordErrorMessage(data?.password);
    }
    // Password confirm
    if (data?.password && data?.confirmPassword && data.password !== data.confirmPassword) {
      errors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    return errors;
  };

  const onSubmit = async () => {
    let errors = {};
    for (const key of keyList) {
      if (data[key] === undefined || data[key] === "") {
        errors[key] = "Ce champ est obligatoire";
      }
    }

    errors = { ...errors, ...validate() };

    if (data.acceptCGU !== "true") {
      errors.acceptCGU = "Vous devez accepter les Conditions Générales d'Utilisation (CGU)";
    }

    if (data.rulesYoung !== "true") {
      errors.rulesYoung = "Vous devez accepter les modalités de traitement de mes données personnelles";
    }
    setError(errors);
    if (Object.keys(errors).length) return;

    if (isCLE) {
      await signUp();
    } else {
      setData({ ...data, email: trimmedEmail, step: PREINSCRIPTION_STEPS.CONFIRM });
      plausibleEvent("Phase0/CTA preinscription - infos persos");
      history.push("/preinscription/confirm");
    }
  };

  const isEmailValidationEnabled = isFeatureEnabled(FEATURES_NAME.EMAIL_VALIDATION, undefined, environment);

  const signUp = async () => {
    const values = {
      email: data.email,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      birthdateAt: dayjs(data.birthDate).locale("fr").format("YYYY-MM-DD"),
      frenchNationality: data.frenchNationality,
      grade: data.grade,
      phone: data.phone,
      phoneZone: data.phoneZone,
      source: YOUNG_SOURCE.CLE,
      classeId,
    };

    try {
      setLoading(true);
      const { code, ok, token, user } = await API.post(`/young/signup`, values);
      if (!ok) {
        setError({ text: `Une erreur s'est produite : ${translate(code)}` });
        setLoading(false);
      }
      if (user) {
        plausibleEvent("CLE/CTA preinscription - infos persos");
        if (token) API.setToken(token);
        await cohortsInit();
        dispatch(setYoung(user));
        history.push(isEmailValidationEnabled ? "/preinscription/email-validation" : "/preinscription/done");
      }
    } catch (e) {
      if (e.code === "USER_ALREADY_REGISTERED") {
        history.push(`/je-suis-deja-inscrit?parcours=CLE&classeId=${classeId}`);
      } else {
        capture(e);
        toastr.error("Erreur", `Une erreur s'est produite : ${translate(e.code)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ProgressBar isReinscription={false} />
      <DSFRContainer
        title="Créez votre compte"
        supportLink={`${supportURL}${isCLE ? "/base-de-connaissance/cle-je-cree-mon-compte-eleve" : "/base-de-connaissance/je-me-preinscris-et-cree-mon-compte-volontaire"}`}
        supportEvent="Phase0/aide preinscription - infos persos">
        {isCLE && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <label htmlFor="nationalite" className="m-0">
                Je suis de nationalité française
              </label>
              <IconFrance />

              <ReactTooltip id="tooltip-nationalite" className="!rounded-lg bg-white text-gray-800 !opacity-100 shadow-xl max-w-sm" arrowColor="white">
                <span className="text-gray-800">
                  Cette information est nécessaire pour l’obtention du certificat individuel de participation à la JDC après réalisation du séjour de cohésion.
                </span>
              </ReactTooltip>

              <div data-tip data-for="tooltip-nationalite">
                <RiInformationLine className="text-blue-france-sun-113 hover:text-blue-france-sun-113-hover" />
              </div>
            </div>

            <div className="flex flex-col md:flex-row mb-4">
              <div className="pr-4 border-r">
                <input
                  className="mr-2"
                  type="radio"
                  id="oui"
                  name="nationalite"
                  value="true"
                  checked={data.frenchNationality === "true" || false}
                  onChange={(e) => setData({ ...data, frenchNationality: e.target.value })}
                />
                <label className="mb-0" htmlFor="oui">
                  Oui
                </label>
              </div>
              <div className="md:px-6">
                <input
                  className="mr-2"
                  type="radio"
                  id="non"
                  name="nationalite"
                  value="false"
                  checked={data.frenchNationality === "false" || false}
                  onChange={(e) => setData({ ...data, frenchNationality: e.target.value })}
                />
                <label className="mb-0" htmlFor="non">
                  Non
                </label>
              </div>
            </div>
            <ErrorMessage>{error?.frenchNationality}</ErrorMessage>
          </>
        )}
        {isCLE && (
          <div className="flex w-full flex-col mb-4">
            <SearchableSelect
              label="Niveau de scolarité"
              value={data.grade}
              options={optionsScolarite}
              onChange={(value) => {
                setData({ ...data, grade: value });
              }}
              placeholder="Sélectionnez une option"
            />
            {error.grade ? <span className="text-sm text-red-500">{error.grade}</span> : null}
          </div>
        )}

        <div className="space-y-5">
          <Input
            label={isCLE ? "Prénom de l'élève" : "Prénom du volontaire"}
            state={error.firstName ? "error" : "default"}
            stateRelatedMessage={error.firstName}
            value={data.firstName}
            onChange={handleNameChange("firstName")}
          />

          <Input
            label={isCLE ? "Nom de famille de l'élève" : "Nom de famille du volontaire"}
            value={data.lastName}
            onChange={handleNameChange("lastName")}
            onBlur={() => setData({ ...data, lastName: data.lastName.toUpperCase() })}
            state={error.firstName ? "error" : "default"}
            stateRelatedMessage={error.firstName}
          />

          {isCLE && (
            <label className="w-full">
              Date de naissance
              <DatePicker initialValue={new Date(data.birthDate)} onChange={(date) => setData({ ...data, birthDate: date })} />
              {error.birthDate ? <span className="text-sm text-red-500">{error.birthDate}</span> : null}
            </label>
          )}

          <InputPhone
            label="Téléphone"
            onChange={(e) => setData({ ...data, phone: e })}
            onChangeZone={(e) => setData({ ...data, phoneZone: e })}
            value={data.phone}
            zoneValue={data.phoneZone}
            placeholder={PHONE_ZONES[data.phoneZone]?.example}
            error={error.phone || error.phoneZone}
            className="w-full"
          />
          <hr className="my-4" />
          <h2 className="text-base font-bold my-4">Mes identifiants de connexion</h2>
          <p className="pl-3 border-l-4 border-l-indigo-500">
            Les identifiants choisis seront ceux à utiliser pour vous connecter sur votre compte {isCLE ? "élève" : "volontaire"}.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Input
              label="E-mail"
              value={data.email}
              onChange={(e) => setData({ ...data, email: e })}
              type="email"
              state={error.email ? "error" : "default"}
              stateRelatedMessage={error.email}
            />

            <Input
              label="Confirmez votre e-mail"
              value={data.emailConfirm}
              onChange={(e) => setData({ ...data, emailConfirm: e })}
              type="email"
              state={error.emailConfirm ? "error" : "default"}
              stateRelatedMessage={error.emailConfirm}
            />

            <InputPassword
              hintText="Il doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole."
              label="Mot de passe"
              error={error?.password}
              value={data.password}
              onChange={(password) => setData({ ...data, password })}></InputPassword>
            <InputPassword
              label="Confirmez votre mot de passe"
              error={error?.confirmPassword}
              value={data.confirmPassword}
              onChange={(confirmPassword) => setData({ ...data, confirmPassword })}></InputPassword>
          </div>

          <div className="flex flex-col gap-1">
            <Checkbox
              state={error.acceptCGU || error.rulesYoung ? "error" : "default"}
              stateRelatedMessage={error.acceptCGU || error.rulesYoung}
              options={[
                {
                  label: (
                    <span className="inline flex-1  text-sm leading-5 text-[#3A3A3A]">
                      J&apos;ai lu et j&apos;accepte les{" "}
                      <a href={`${appURL}/conditions-generales-utilisation`} target="_blank" rel="noreferrer">
                        Conditions Générales d&apos;Utilisation (CGU)
                      </a>{" "}
                      de la plateforme du Service National Universel.
                    </span>
                  ),
                  nativeInputProps: {
                    checked: data?.acceptCGU === "true",
                    onChange: () => setData({ ...data, acceptCGU: data?.acceptCGU === "true" ? "false" : "true" }),
                  },
                },
                {
                  label: (
                    <span className="inline flex-1 text-sm leading-5 text-[#3A3A3A]">
                      J&apos;ai pris connaissance des{" "}
                      <a href="https://www.snu.gouv.fr/donnees-personnelles/" target="_blank" rel="noreferrer">
                        modalités de traitement de mes données personnelles.
                      </a>
                    </span>
                  ),
                  nativeInputProps: {
                    checked: data?.rulesYoung === "true",
                    onChange: () => setData({ ...data, rulesYoung: data?.rulesYoung === "true" ? "false" : "true" }),
                  },
                },
              ]}
            />
          </div>
        </div>
        <ErrorMessage>{error?.text}</ErrorMessage>
        <SignupButtons
          onClickNext={() => onSubmit()}
          onClickPrevious={isCLE ? () => history.push(`/je-rejoins-ma-classe-engagee?id=${classeId}`) : () => history.push("/preinscription/sejour")}
          labelNext={isCLE ? "Recevoir un code d’activation par e-mail" : "Continuer"}
          labelPrevious="Retour"
          collapsePrevious={true}
          disabled={loading}
        />
      </DSFRContainer>
    </>
  );
}
