import React from "react";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import { PreInscriptionContext } from "../../../context/PreInscriptionContextProvider";
import Input from "../components/input";
import validator from "validator";
import Eye from "../../../assets/icons/Eye";
import EyeOff from "../../../assets/icons/EyeOff";
import { getPasswordErrorMessage } from "../../../utils";
import CheckBox from "../components/checkbox";
import { appURL } from "../../../config";
import StickyButton from "../components/stickyButton";
import { useHistory, Link } from "react-router-dom";

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
  }, [data.email, data.emailConfirm, data.password, data.confirmPassword]);

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
      history.push("/preinscription/confirm");
    }
  };

  return (
    <>
      <div className="bg-white px-4 pt-4 pb-12">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-xl text-[#161616]">Créez votre compte</h1>
          <Link to="/public-besoin-d-aide/">
            <QuestionMarkBlueCircle />
          </Link>
        </div>
        <hr className="my-4 h-px bg-gray-200 border-0" />
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-[#161616] text-base">Prénom</label>
            <Input value={data.firstName} onChange={(e) => setData({ ...data, firstName: e })} />
            {error.firstName && <span className="text-red-500 text-sm">{error.firstName}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[#161616] text-base">Nom</label>
            <Input value={data.lastName} onChange={(e) => setData({ ...data, lastName: e })} />
            {error.lastName && <span className="text-red-500 text-sm">{error.lastName}</span>}
          </div>
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
            {error.password ? <span className="text-red-500 text-sm">{error.password}</span> : null}
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
                <a className="underline" href="https://www.snu.gouv.fr/donnees-personnelles-et-cookies-23" target="_blank" rel="noreferrer">
                  modalités de traitement de mes données personnelles
                </a>
              </span>
            </div>
            {error.rulesYoung ? <span className="text-red-500 text-sm">{error.rulesYoung}</span> : null}
          </div>
        </div>
      </div>
      <StickyButton text="Continuer" onClick={() => onSubmit()} onClickPrevious={() => history.push("/preinscription")} />
    </>
  );
}
