import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import { isPhoneNumberWellFormated, PHONE_ZONES, translate, YOUNG_STATUS } from "snu-lib";
import validator from "validator";
import { setYoung } from "../../../../redux/auth/actions";
import { capture } from "../../../../sentry";
import API from "../../../../services/api";
import plausibleEvent from "../../../../services/plausible";
import { getCorrectionByStep } from "../../../../utils/navigation";
import Input from "../../components/Input";
import { supportURL } from "@/config";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import SignupButtonContainer from "@/components/dsfr/ui/buttons/SignupButtonContainer";
import PhoneField from "@/components/dsfr/forms/PhoneField";

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
    phone: young.phone,
    phoneZone: young.phoneZone,
    firstName: young.firstName,
    lastName: young.lastName,
  });

  const trimmedPhone = data?.phone?.replace(/\s/g, "");
  const trimmedEmail = data?.email.trim();
  const trimmedEmailConfirm = data?.emailConfirm.trim();

  const keyList = ["firstName", "lastName", "phone", "phoneZone", "email", "emailConfirm"];

  const validate = () => {
    let errors = {};

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
      <DSFRContainer title="Mon profil" supportLink={supportURL + "/base-de-connaissance/phase-0-les-inscriptions"}>
        <div className="flex flex-col">
          <Input value={data.firstName} onChange={(e) => setData({ ...data, firstName: e })} label="Prénom" error={error.firstName} correction={corrections.firstName} />
          <Input value={data.lastName} onChange={(e) => setData({ ...data, lastName: e })} label="Nom" error={error.lastName} correction={corrections.lastName} />
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
          <p className="pl-3 border-l-4 border-l-indigo-500">Les identifiants choisis seront ceux à utiliser pour vous connecter sur votre compte volontaire.</p>
          <Input value={data.email} onChange={(e) => setData({ ...data, email: e })} label="E-mail" error={error.email} correction={corrections.email} type="email" />
          <Input value={data.emailConfirm} onChange={(e) => setData({ ...data, emailConfirm: e })} label="Confirmez votre e-mail" error={error.emailConfirm} type="email" />
        </div>
        <SignupButtonContainer labelNext="Corriger" onClickNext={onSubmit} disabled={Object.keys(error).length > 0 || loading} />
      </DSFRContainer>
    </>
  );
}
