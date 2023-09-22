import React from "react";
import { useHistory } from "react-router-dom";
import validator from "validator";
import Eye from "../../../assets/icons/Eye";
import EyeOff from "../../../assets/icons/EyeOff";
import DSFRContainer from "../../../components/dsfr/layout/DSFRContainer";
import CheckBox from "../../../components/dsfr/forms/checkbox";
import Input from "../../../components/dsfr/forms/input";
import SignupButtonContainer from "../../../components/dsfr/ui/buttons/SignupButtonContainer";
import { appURL, supportURL } from "../../../config";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import plausibleEvent from "../../../services/plausible";
import { getPasswordErrorMessage } from "../../../utils";
import { PREINSCRIPTION_STEPS } from "../../../utils/navigation";
import ProgressBar from "../components/ProgressBar";

export default function StepProfil() {
  const [data, setData] = React.useContext(PreInscriptionContext);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [error, setError] = React.useState({});
  const keyList = ["firstName", "lastName", "email", "emailConfirm", "password", "confirmPassword"];
  const history = useHistory();

  const trimmedEmail = data?.email?.trim();
  const trimmedEmailConfirm = data?.emailConfirm?.trim();

  const validate = () => {
    let errors = {};
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

  React.useEffect(() => {
    setError(validate());
  }, [data.email, data.emailConfirm, data.password, data.confirmPassword, data.acceptCGU, data.rulesYoung]);

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
    if (!Object.keys(errors).length) {
      setData({ ...data, email: trimmedEmail, step: PREINSCRIPTION_STEPS.CONFIRM });
      plausibleEvent("Phase0/CTA preinscription - infos persos");
      history.push("/preinscription/confirm");
    }
  };

  return (
    <>
      <ProgressBar />
      <DSFRContainer supportLink={supportURL + "/base-de-connaissance/je-me-preinscris-et-cree-mon-compte-volontaire"} title="Créez votre compte">
        <div className="space-y-5">
          <div className="flex flex-col gap-1">
            <label>Prénom du volontaire</label>
            <Input value={data.firstName} onChange={(e) => setData({ ...data, firstName: e })} />
            {error.firstName && <span className="text-sm text-red-500">{error.firstName}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-base text-[#161616]">Nom du volontaire</label>
            <Input value={data.lastName} onChange={(e) => setData({ ...data, lastName: e })} />
            {error.lastName && <span className="text-sm text-red-500">{error.lastName}</span>}
          </div>

          <div className="grid grid-rows-2 gap-4 md:grid-cols-2 md:grid-rows-1">
            <div className="flex flex-col gap-1">
              <label className="text-base text-[#161616]">E-mail</label>
              <Input value={data.email} onChange={(e) => setData({ ...data, email: e })} type="email" />
              {error.email ? <span className="text-sm text-red-500">{error.email}</span> : null}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-base text-[#161616]">Confirmez votre e-mail</label>
              <Input value={data.emailConfirm} onChange={(e) => setData({ ...data, emailConfirm: e })} type="email" />
              {error.emailConfirm ? <span className="text-sm text-red-500">{error.emailConfirm}</span> : null}
            </div>
          </div>

          <div className="grid grid-rows-2 gap-4 md:grid-cols-2 md:grid-rows-1">
            <div className="flex flex-col gap-1">
              <label className="text-base text-[#161616]">Mot de passe</label>
              <div className="flex w-full items-center rounded-t-[4px] border-b-[2px] border-[#3A3A3A] bg-[#EEEEEE] px-4 py-2">
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
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-base text-[#161616]">Confirmez votre mot de passe</label>
              <div className="flex w-full items-center rounded-t-[4px] border-b-[2px] border-[#3A3A3A] bg-[#EEEEEE] px-4 py-2">
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
            </div>
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
        <SignupButtonContainer
          onClickNext={() => onSubmit()}
          onClickPrevious={() => history.push("/preinscription/sejour")}
          labelPrevious="Retour au choix du séjour"
          collapsePrevious={true}
        />
      </DSFRContainer>
    </>
  );
}
