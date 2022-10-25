import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { YOUNG_STATUS } from "snu-lib";
import validator from "validator";
import QuestionMarkBlueCircle from "../../../../assets/icons/QuestionMarkBlueCircle";
import { getCorrectionByStep } from "../../../../utils/navigation";
import Input from "../../components/Input";

export default function StepProfil() {
  const [data, setData] = React.useState({});
  const young = useSelector((state) => state.Auth.young);
  const [error, setError] = React.useState({});
  const [corrections, setCorrections] = React.useState({});
  const keyList = ["firstName", "lastName", "email", "emailConfirm"];
  const history = useHistory();
  const { step } = useParams();

  useEffect(() => {
    if (!young) return;
    if (young.status === YOUNG_STATUS.WAITING_CORRECTION) {
      const corrections = getCorrectionByStep(young, step);
      if (!Object.keys(corrections).length) return history.push("/");
      else setCorrections(corrections);
    }
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

    setError(errors);
    if (!Object.keys(errors).length) {
      history.push("/");
    }
  };

  return (
    <>
      <div className="bg-[#f9f6f2] flex justify-center py-10">
        <div className="bg-white basis-[70%] mx-auto my-0 px-[102px] py-[60px]">
          <div className="w-full flex justify-between items-center">
            <h1 className="text-xl text-[#161616]">Mon profil</h1>
            <a href="/public-besoin-d-aide/" target="_blank" rel="noreferrer">
              <QuestionMarkBlueCircle />
            </a>
          </div>
          <hr className="my-8 h-px bg-gray-200 border-0" />
          <div className="flex flex-col">
            <Input value={data.firstName} onChange={(e) => setData({ ...data, firstName: e })} label="Prénom" error={error.firstName} correction={corrections.firstName} />
            <Input value={data.lastName} onChange={(e) => setData({ ...data, lastName: e })} label="Nom" error={error.lastName} correction={corrections.lastName} />
            <Input value={data.email} onChange={(e) => setData({ ...data, email: e })} label="E-mail" error={error.email} correction={corrections.email} />
            <Input value={data.emailConfirm} onChange={(e) => setData({ ...data, emailConfirm: e })} label="Confirmez votre e-mail" error={error.emailConfirm} />
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
