import React from "react";
import { useHistory } from "react-router-dom";
import validator from "validator";
import Eye from "../../../assets/icons/Eye";
import EyeOff from "../../../assets/icons/EyeOff";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import CheckBox from "../../../components/dsfr/forms/checkbox";
import Input from "../../../components/dsfr/forms/input";
import SignupButtonContainer from "../../../components/dsfr/ui/buttons/SignupButtonContainer";
import { appURL, environment, supportURL } from "../../../config";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import plausibleEvent from "../../../services/plausible";
import { getPasswordErrorMessage } from "../../../utils";
import { PREINSCRIPTION_STEPS } from "../../../utils/navigation";
import ProgressBar from "../components/ProgressBar";
import PhoneField from "@/components/dsfr/forms/PhoneField";
import { PHONE_ZONES, isPhoneNumberWellFormated, FEATURES_NAME, isFeatureEnabled, translate, YOUNG_SOURCE } from "snu-lib";
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

export default function StepProfil() {
  const [data, setData] = React.useContext(PreInscriptionContext);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [error, setError] = React.useState({});
  const [loading, setLoading] = React.useState(false);
  const keyList = ["firstName", "lastName", "phone", "phoneZone", "email", "emailConfirm", "password", "confirmPassword"];
  const history = useHistory();
  const dispatch = useDispatch();
  const isCLE = new URLSearchParams(window.location.search).get("parcours")?.toUpperCase() === YOUNG_SOURCE.CLE;
  const classeId = new URLSearchParams(window.location.search).get("classeId");

  const trimmedPhone = data?.phone?.replace(/\s/g, "");
  const trimmedEmail = data?.email?.trim();
  const trimmedEmailConfirm = data?.emailConfirm?.trim();

  const validate = () => {
    let errors = {};

    if (isCLE && !data?.frenchNationality) {
      errors.frenchNationality = "Ce champ est obligatoire";
    }
    if (isCLE && !data?.birthDate) {
      errors.birthDate = "Ce champ est obligatoire";
    }
    if (data?.phone && !isPhoneNumberWellFormated(trimmedPhone, data?.phoneZone)) {
      errors.phone = PHONE_ZONES[data?.phoneZone]?.errorMessage;
    }

    //Email
    if (trimmedEmail && !validator.isEmail(trimmedEmail)) {
      errors.email = "L'e-mail renseigné est invalide";
    }
    //Email confirm
    if (trimmedEmail && trimmedEmailConfirm && trimmedEmail !== trimmedEmailConfirm) {
      errors.emailConfirm = "Les emails ne correspondent pas";
    }
    //Password
    if (data?.password && getPasswordErrorMessage(data?.password)) {
      errors.password = getPasswordErrorMessage(data?.password);
    }
    //Password confirm
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
        // plausibleEvent(); Event name TBD
        if (token) API.setToken(token);
        dispatch(setYoung(user));
        history.push(isEmailValidationEnabled ? "/preinscription/email-validation" : "/preinscription/done");
      }
    } catch (e) {
      if (e.code === "USER_ALREADY_REGISTERED") {
        setError({ text: "Vous avez déjà un compte sur la plateforme SNU, renseigné avec ces informations (identifiant, prénom, nom et date de naissance)." });
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
      {!isCLE && <ProgressBar />}

      <DSFRContainer
        title="Créez votre compte"
        supportLink={supportURL + "/base-de-connaissance/je-me-preinscris-et-cree-mon-compte-volontaire"}
        supportEvent="Phase0/aide preinscription - infos persos">
        {isCLE && (
          <>
            <div className="flex items-center gap-2 mb-3">
              <label htmlFor="nationalite" className="m-0">
                Je suis de nationalié française
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

        <div className="space-y-5">
          <label className="w-full">
            {isCLE ? "Prénom de l'élève" : "Prénom du volontaire"}
            <Input value={data.firstName} onChange={(e) => setData({ ...data, firstName: e })} />
            {error.firstName && <span className="text-sm text-red-500">{error.firstName}</span>}
          </label>

          <label className="w-full">
            {isCLE ? "Nom de famille de l'élève" : "Nom de famille du volontaire"}
            <Input value={data.lastName} onChange={(e) => setData({ ...data, lastName: e })} />
            {error.lastName && <span className="text-sm text-red-500">{error.lastName}</span>}
          </label>

          {isCLE && (
            <label className="w-full">
              Date de naissance
              <DatePicker value={new Date(data.birthDate)} onChange={(date) => setData({ ...data, birthDate: date })} />
              {error.birthDate ? <span className="text-sm text-red-500">{error.birthDate}</span> : null}
            </label>
          )}

          <PhoneField
            label="Téléphone"
            onChange={(e) => setData({ ...data, phone: e })}
            onChangeZone={(e) => setData({ ...data, phoneZone: e })}
            value={data.phone}
            zoneValue={data.phoneZone}
            placeholder={PHONE_ZONES[data.phoneZone]?.example}
            error={error.phone || error.phoneZone}
            className="mt-3"
          />

          <hr className="my-4" />
          <h2 className="text-base font-bold my-4">Mes identifiants de connexion</h2>
          <p className="pl-3 border-l-4 border-l-indigo-500">
            Les identifiants choisis seront ceux à utiliser pour vous connecter sur votre compte {isCLE ? "élève" : "volontaire"}.
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <label className="w-full">
              E-mail
              <Input value={data.email} onChange={(e) => setData({ ...data, email: e })} type="email" />
              {error.email ? <span className="text-sm text-red-500">{error.email}</span> : null}
            </label>

            <label className="w-full">
              Confirmez votre e-mail
              <Input value={data.emailConfirm} onChange={(e) => setData({ ...data, emailConfirm: e })} type="email" />
              {error.emailConfirm ? <span className="text-sm text-red-500">{error.emailConfirm}</span> : null}
            </label>

            <label className="w-full">
              Mot de passe
              <div className="flex w-full items-center rounded-t-[4px] border-b-[2px] border-[#3A3A3A] bg-[#EEEEEE] px-4 py-2 mt-2">
                <input
                  className="w-full bg-inherit"
                  type={showPassword ? "text" : "password"}
                  value={data.password}
                  onChange={(e) => setData({ ...data, password: e.target.value })}
                />
                {showPassword ? (
                  <EyeOff className="cursor-pointer" onClick={() => setShowPassword(false)} />
                ) : (
                  <Eye className="cursor-pointer" onClick={() => setShowPassword(true)} />
                )}
              </div>
              <p className={`text-sm ${error?.password ? "text-red-500" : " text-[#3A3A3A]"}`}>
                Il doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole.
              </p>
            </label>

            <label className="w-full">
              Confirmez votre mot de passe
              <div className="flex w-full items-center rounded-t-[4px] border-b-[2px] border-[#3A3A3A] bg-[#EEEEEE] px-4 py-2 mt-2">
                <input
                  className="w-full bg-inherit"
                  type={showConfirmPassword ? "text" : "password"}
                  value={data.confirmPassword}
                  onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
                />
                {showConfirmPassword ? (
                  <EyeOff className="cursor-pointer" onClick={() => setShowConfirmPassword(false)} />
                ) : (
                  <Eye className="cursor-pointer" onClick={() => setShowConfirmPassword(true)} />
                )}
              </div>
              {error.confirmPassword ? <span className="text-sm text-red-500">{error.confirmPassword}</span> : null}
            </label>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <CheckBox checked={data?.acceptCGU === "true"} onChange={(e) => setData({ ...data, acceptCGU: e ? "true" : "false" })} />
              <span className="inline flex-1  text-sm leading-5 text-[#3A3A3A]">
                J&apos;ai lu et j&apos;accepte les{" "}
                <a className="underline " href={`${appURL}/conditions-generales-utilisation`} target="_blank" rel="noreferrer">
                  Conditions Générales d&apos;Utilisation (CGU)
                </a>{" "}
                de la plateforme du Service National Universel.
              </span>
            </div>
            {error.acceptCGU ? <span className="text-sm text-red-500">{error.acceptCGU}</span> : null}
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-4">
              <CheckBox checked={data?.rulesYoung === "true"} onChange={(e) => setData({ ...data, rulesYoung: e ? "true" : "false" })} />
              <span className="inline flex-1 text-sm leading-5 text-[#3A3A3A]">
                J&apos;ai pris connaissance des{" "}
                <a className="underline" href="https://www.snu.gouv.fr/donnees-personnelles" target="_blank" rel="noreferrer">
                  modalités de traitement de mes données personnelles
                </a>
              </span>
            </div>
            {error.rulesYoung ? <span className="text-sm text-red-500">{error.rulesYoung}</span> : null}
          </div>
        </div>
        <ErrorMessage>{error?.text}</ErrorMessage>
        <SignupButtonContainer
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
