import React from "react";
import { useHistory } from "react-router-dom";
import validator from "validator";
import Eye from "../../../assets/icons/Eye";
import EyeOff from "../../../assets/icons/EyeOff";
import DSFRContainer from "../../../components/inscription/DSFRContainer";
import CheckBox from "../../../components/inscription/checkbox";
import Input from "../../../components/inscription/input";
import SignupButtonContainer from "../../../components/inscription/SignupButtonContainer";
import { appURL } from "../../../config";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import plausibleEvent from "../../../services/plausible";
import { getPasswordErrorMessage } from "../../../utils";
import { PREINSCRIPTION_STEPS } from "../../../utils/navigation";

export default function StepProfil() {
  const [data, setData] = React.useContext(PreInscriptionContext);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [error, setError] = React.useState({});
  const keyList = ["firstName", "lastName", "email", "emailConfirm", "password", "confirmPassword"];
  const history = useHistory();

  const validate = () => {
    let errors = {};
    //Email
    if (data?.email && !validator.isEmail(data.email)) {
      errors.email = "L'e-mail renseigné est invalide";
    }
    //Email confirm
    if (data?.email && data?.emailConfirm && data.email !== data.emailConfirm) {
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
      setData({ ...data, step: PREINSCRIPTION_STEPS.CONFIRM });
      plausibleEvent("Phase0/CTA preinscription - infos persos");
      history.push("/preinscription/confirm");
    }
  };

  return (
    <DSFRContainer title="Créez votre compte">
      <div className="space-y-5">
        <div className="flex flex-col gap-1">
          <label>Prénom</label>
          <Input value={data.firstName} onChange={(e) => setData({ ...data, firstName: e })} />
          {error.firstName && <span className="text-red-500 text-sm">{error.firstName}</span>}
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[#161616] text-base">Nom</label>
          <Input value={data.lastName} onChange={(e) => setData({ ...data, lastName: e })} />
          {error.lastName && <span className="text-red-500 text-sm">{error.lastName}</span>}
        </div>

        <div className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[#161616] text-base">E-mail</label>
            <Input value={data.email} onChange={(e) => setData({ ...data, email: e })} />
            {error.email ? <span className="text-red-500 text-sm">{error.email}</span> : null}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[#161616] text-base">Confirmez votre e-mail</label>
            <Input value={data.emailConfirm} onChange={(e) => setData({ ...data, emailConfirm: e })} />
            {error.emailConfirm ? <span className="text-red-500 text-sm">{error.emailConfirm}</span> : null}
          </div>
        </div>

        <div className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[#161616] text-base">Mot de passe</label>
            <div className="flex items-center w-full bg-[#EEEEEE] px-4 py-2 border-b-[2px] border-[#3A3A3A] rounded-t-[4px]">
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
            <label className="text-[#161616] text-base">Confirmez votre mot de passe</label>
            <div className="flex items-center w-full bg-[#EEEEEE] px-4 py-2 border-b-[2px] border-[#3A3A3A] rounded-t-[4px]">
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
            {error.confirmPassword ? <span className="text-red-500 text-sm">{error.confirmPassword}</span> : null}
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <CheckBox checked={data?.acceptCGU === "true"} onChange={(e) => setData({ ...data, acceptCGU: e ? "true" : "false" })} />
            <span className="text-sm text-[#3A3A3A]  flex-1 inline leading-5">
              J&apos;ai lu et j&apos;accepte les{" "}
              <a className="underline " href={`${appURL}/conditions-generales-utilisation`} target="_blank" rel="noreferrer">
                Conditions Générales d&apos;Utilisation (CGU)
              </a>{" "}
              de la plateforme du Service National Universel.
            </span>
          </div>
          {error.acceptCGU ? <span className="text-red-500 text-sm">{error.acceptCGU}</span> : null}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-4">
            <CheckBox checked={data?.rulesYoung === "true"} onChange={(e) => setData({ ...data, rulesYoung: e ? "true" : "false" })} />
            <span className="text-sm text-[#3A3A3A] flex-1 inline leading-5">
              J&apos;ai pris connaissance des{" "}
              <a className="underline" href="https://www.snu.gouv.fr/donnees-personnelles" target="_blank" rel="noreferrer">
                modalités de traitement de mes données personnelles
              </a>
            </span>
          </div>
          {error.rulesYoung ? <span className="text-red-500 text-sm">{error.rulesYoung}</span> : null}
        </div>
      </div>
      <SignupButtonContainer onClickNext={() => onSubmit()} onClickPrevious={() => history.push("/preinscription/sejour")} labelPrevious="Retour au choix du séjour" />
    </DSFRContainer>
  );
}
