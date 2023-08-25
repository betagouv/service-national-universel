import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { translate, YOUNG_STATUS } from "snu-lib";
import validator from "validator";
import QuestionMarkBlueCircle from "../../../../assets/icons/QuestionMarkBlueCircle";
import Footer from "@/components/dsfr/layout/Footer";
import StickyButton from "../../../../components/dsfr/ui/buttons/stickyButton";
import { setYoung } from "../../../../redux/auth/actions";
import { capture } from "../../../../sentry";
import API from "../../../../services/api";
import plausibleEvent from "../../../../services/plausible";
import { getCorrectionByStep } from "../../../../utils/navigation";
import Input from "../../components/Input";

export default function StepProfil() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const { step } = useParams();
  const dispatch = useDispatch();

  const corrections = young.status === YOUNG_STATUS.WAITING_CORRECTION ? getCorrectionByStep(young, step) : [];
  if (young.status === YOUNG_STATUS.WAITING_CORRECTION && !Object.keys(corrections).length) history.push("/");

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState({});
  const [data, setData] = React.useState({
    email: young.email,
    emailConfirm: young.email,
    firstName: young.firstName,
    lastName: young.lastName,
  });

  const trimmedEmail = data?.email.trim();
  const trimmedEmailConfirm = data?.emailConfirm.trim();

  const keyList = ["firstName", "lastName", "email", "emailConfirm"];

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
      const formattedData = { ...data, email: trimmedEmail };
      setLoading(true);
      try {
        const { ok, code, data: responseData } = await API.put(`/young/inscription2023/profil`, formattedData);
        if (!ok) {
          setError({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
          setLoading(false);
          return;
        }
        plausibleEvent("Phase0/CTA demande correction - Corriger Profil");
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
        <div className="flex w-full items-center justify-between">
          <h1 className="text-xl text-[#161616]">Mon profil</h1>
          <a href="/public-besoin-d-aide/" target="_blank" rel="noreferrer">
            <QuestionMarkBlueCircle />
          </a>
        </div>
        <hr className="my-4 h-px border-0 bg-gray-200" />
        <div className="flex flex-col">
          <Input value={data.firstName} onChange={(e) => setData({ ...data, firstName: e })} label="Prénom" error={error.firstName} correction={corrections.firstName} />
          <Input value={data.lastName} onChange={(e) => setData({ ...data, lastName: e })} label="Nom" error={error.lastName} correction={corrections.lastName} />
          <Input value={data.email} onChange={(e) => setData({ ...data, email: e })} label="E-mail" error={error.email} correction={corrections.email} type="email" />
          <Input value={data.emailConfirm} onChange={(e) => setData({ ...data, emailConfirm: e })} label="Confirmez votre e-mail" error={error.emailConfirm} type="email" />
        </div>
      </div>
      <Footer marginBottom="mb-[88px]" />
      <StickyButton text="Corriger" onClick={() => onSubmit()} disabled={loading} />
    </>
  );
}
