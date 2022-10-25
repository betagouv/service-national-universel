import React from "react";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import validator from "validator";
import Eye from "../../../../assets/icons/Eye";
import EyeOff from "../../../../assets/icons/EyeOff";
import QuestionMarkBlueCircle from "../../../../assets/icons/QuestionMarkBlueCircle";
import CheckBox from "../../../../components/inscription/checkbox";
import Input from "../../../../components/inscription/input";
import { appURL } from "../../../../config";
import plausibleEvent from "../../../../services/plausible";
import { getPasswordErrorMessage } from "../../../../utils";

export default function StepProfil() {
  const [data, setData] = React.useState({});
  const young = useSelector((state) => state.Auth.young);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [error, setError] = React.useState({});
  const keyList = ["firstName", "lastName", "email", "emailConfirm"];
  const history = useHistory();

  useEffect(() => {
    if (!young) return;

    setData({ email: young.email, emailConfirm: young.email, firstName: young.firstName, lastName: young.lastName });
  }, [young]);

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
      setData({ ...data });
      plausibleEvent("Phase0/CTA preinscription - infos persos");
      history.push("/preinscription/confirm");
    }
  };

  return (
    <>
      <div className="bg-[#f9f6f2] flex justify-center py-10">
        <div className="bg-white basis-[70%] mx-auto my-0 px-[102px] py-[60px]">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-xl text-[#161616]">Créez votre compte</h1>
            <a href="/public-besoin-d-aide/" target="_blank" rel="noreferrer">
              <QuestionMarkBlueCircle />
            </a>
          </div>
          <hr className="my-8 h-px bg-gray-200 border-0" />
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
            <div className="flex gap-8">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[#161616] text-base">E-mail</label>
                <Input value={data.email} onChange={(e) => setData({ ...data, email: e })} />
                {error.email ? <span className="text-red-500 text-sm">{error.email}</span> : null}
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[#161616] text-base">Confirmez votre e-mail</label>
                <Input value={data.emailConfirm} onChange={(e) => setData({ ...data, emailConfirm: e })} />
                {error.emailConfirm ? <span className="text-red-500 text-sm">{error.emailConfirm}</span> : null}
              </div>
            </div>
            <div className="flex justify-end gap-4">
              <button
                className="flex items-center justify-center px-3 py-2 cursor-pointer bg-[#000091] text-white hover:bg-white hover:!text-[#000091] hover:border hover:border-[#000091]"
                onClick={() => onSubmit()}>
                Corriger
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
