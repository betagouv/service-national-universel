import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { translate, YOUNG_STATUS } from "snu-lib";
import validator from "validator";
import QuestionMarkBlueCircle from "../../../../assets/icons/QuestionMarkBlueCircle";
import Footer from "../../../../components/footerV2";
import StickyButton from "../../../../components/inscription/stickyButton";
import { setYoung } from "../../../../redux/auth/actions";
import { capture } from "../../../../sentry";
import API from "../../../../services/api";
import { getCorrectionByStep } from "../../../../utils/navigation";
import Input from "../../components/Input";

export default function StepProfil() {
  const [data, setData] = React.useState({});
  const young = useSelector((state) => state.Auth.young);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState({});
  const [corrections, setCorrections] = React.useState({});
  const keyList = ["firstName", "lastName", "email", "emailConfirm"];
  const history = useHistory();
  const { step } = useParams();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!young) return;
    if (young.status === YOUNG_STATUS.WAITING_CORRECTION) {
      const corrections = getCorrectionByStep(young, step);
      if (!Object.keys(corrections).length) return history.push("/");
      else setCorrections(corrections);
    } else {
      history.push("/");
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
      setLoading(true);
      try {
        const { ok, code, data: responseData } = await API.put(`/young/inscription2023/profil`, data);
        if (!ok) {
          setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
          setLoading(false);
          return;
        }
        dispatch(setYoung(responseData));
        history.push("/");
      } catch (e) {
        capture(e);
        setError({
          text: `Une erreur s'est produite`,
          subText: e?.code ? translate(e.code) : "",
        });
      }
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-white px-4 pt-4 pb-12">
        <div className="w-full flex justify-between items-center">
          <h1 className="text-xl text-[#161616]">Mon profil</h1>
          <a href="/public-besoin-d-aide/" target="_blank" rel="noreferrer">
            <QuestionMarkBlueCircle />
          </a>
        </div>
        <hr className="my-4 h-px bg-gray-200 border-0" />
        <div className="flex flex-col">
          <Input value={data.firstName} onChange={(e) => setData({ ...data, firstName: e })} label="Prénom" error={error.firstName} correction={corrections.firstName} />
          <Input value={data.lastName} onChange={(e) => setData({ ...data, lastName: e })} label="Nom" error={error.lastName} correction={corrections.lastName} />
          <Input value={data.email} onChange={(e) => setData({ ...data, email: e })} label="E-mail" error={error.email} correction={corrections.email} />
          <Input value={data.emailConfirm} onChange={(e) => setData({ ...data, emailConfirm: e })} label="Confirmez votre e-mail" error={error.emailConfirm} />
        </div>
      </div>
      <Footer marginBottom="mb-[88px]" />
      <StickyButton text="Corriger" onClick={() => onSubmit()} disabled={loading} />
    </>
  );
}
