import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory, useParams } from "react-router-dom";
import { YOUNG_STATUS } from "snu-lib";
import validator from "validator";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import Error from "../../../components/error";
import CheckBox from "../../../components/inscription/checkbox";
import { supportURL } from "../../../config";
import { setYoung } from "../../../redux/auth/actions";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import plausibleEvent from "../../../services/plausible";
import { regexPhoneFrenchCountries, translate } from "../../../utils";
import { getCorrectionByStep } from "../../../utils/navigation";
import Help from "../components/Help";
import Input from "../components/Input";
import Navbar from "../components/Navbar";
import RadioButton from "../components/RadioButton";

const parentsStatus = [
  { label: "Mère", value: "mother" },
  { label: "Père", value: "father" },
  { label: "Autre", value: "representant" },
];

export default function StepRepresentants() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const parent1Keys = ["parent1Status", "parent1FirstName", "parent1LastName", "parent1Email", "parent1Phone"];
  const parent2Keys = ["parent2Status", "parent2FirstName", "parent2LastName", "parent2Email", "parent2Phone"];
  const [loading, setLoading] = React.useState(false);
  const [corrections, setCorrections] = React.useState({});
  const [errors, setErrors] = React.useState({});
  const [isParent2Visible, setIsParent2Visible] = React.useState(true);
  const dispatch = useDispatch();
  const { step } = useParams();

  const [data, setData] = React.useState({
    parent1Status: "",
    parent1FirstName: "",
    parent1LastName: "",
    parent1Email: "",
    parent1Phone: "",
    parent2Status: "",
    parent2FirstName: "",
    parent2LastName: "",
    parent2Email: "",
    parent2Phone: "",
  });

  React.useEffect(() => {
    if (young) {
      setData({
        parent1Status: young.parent1Status,
        parent1FirstName: young.parent1FirstName,
        parent1LastName: young.parent1LastName,
        parent1Email: young.parent1Email,
        parent1Phone: young.parent1Phone,
        parent2Status: young.parent2Status,
        parent2FirstName: young.parent2FirstName,
        parent2LastName: young.parent2LastName,
        parent2Email: young.parent2Email,
        parent2Phone: young.parent2Phone,
      });
    }
    if (young.status === YOUNG_STATUS.WAITING_CORRECTION) {
      const corrections = getCorrectionByStep(young, step);
      if (!Object.keys(corrections).length) return history.push("/");
      else setCorrections(corrections);
      if (!young?.parent2Email) setIsParent2Visible(false);
    }
  }, [young]);

  const getErrors = () => {
    let errors = {};
    if (data.parent1Phone && !validator.matches(data.parent1Phone, regexPhoneFrenchCountries)) {
      errors.parent1Phone = "Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX";
    } else errors.parent1Phone = undefined;
    if (data.parent1Email && !validator.isEmail(data.parent1Email)) {
      errors.parent1Email = "L'adresse email n'est pas valide";
    } else errors.parent1Email = undefined;
    if (data.parent2Phone && !validator.matches(data.parent2Phone, regexPhoneFrenchCountries)) {
      errors.parent2Phone = "Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX";
    } else errors.parent2Phone = undefined;
    if (data.parent2Email && !validator.isEmail(data.parent2Email)) {
      errors.parent2Email = "L'adresse email n'est pas valide";
    } else errors.parent2Email = undefined;
    return errors;
  };

  React.useEffect(() => {
    setErrors({ ...errors, ...getErrors() });
  }, [data.parent1Email, data.parent1Phone, data.parent2Email, data.parent2Phone]);

  const onSubmit = async () => {
    setLoading(true);
    let error = {};
    error = getErrors();
    for (const key of parent1Keys) {
      if (data[key] === undefined || data[key] === "") {
        error[key] = "Ce champ est obligatoire";
      }
    }

    if (isParent2Visible) {
      for (const key of parent2Keys) {
        if (data[key] === undefined || data[key] === "") {
          error[key] = "Ce champ est obligatoire";
        }
      }
    }
    for (const key in error) {
      if (error[key] === undefined) {
        delete error[key];
      }
    }
    setErrors(error);
    if (!Object.keys(error).length) {
      const value = data;
      if (!isParent2Visible) {
        value.parent2 = false;
        delete value.parent2Status;
        delete value.parent2FirstName;
        delete value.parent2LastName;
        delete value.parent2Email;
        delete value.parent2Phone;
      } else {
        value.parent2 = true;
      }

      try {
        const { ok, code, data: responseData } = await api.put(`/young/inscription2023/representants/next`, value);
        if (!ok) {
          setErrors({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
          setLoading(false);
          return;
        }
        dispatch(setYoung(responseData));
        plausibleEvent("Phase0/CTA inscription - representants legaux");
        history.push("/inscription2023/documents");
      } catch (e) {
        capture(e);
        setErrors({
          text: `Une erreur s'est produite`,
          subText: e?.code ? translate(e.code) : "",
        });
      }
    }
    setLoading(false);
  };

  const onCorrection = async () => {
    setLoading(true);
    try {
      const value = data;
      if (!isParent2Visible) {
        value.parent2 = false;
        delete value.parent2Status;
        delete value.parent2FirstName;
        delete value.parent2LastName;
        delete value.parent2Email;
        delete value.parent2Phone;
      } else {
        value.parent2 = true;
      }
      const { ok, code, data: responseData } = await api.put(`/young/inscription2023/representants/correction`, value);
      if (!ok) {
        setErrors({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
        setLoading(false);
        return;
      }
      plausibleEvent("Phase0/CTA demande correction - Corriger Representant");
      dispatch(setYoung(responseData));
      toastr.success("Vos informations ont bien été enregistrées");
    } catch (e) {
      capture(e);
      setErrors({
        text: `Une erreur s'est produite`,
        subText: e?.code ? translate(e.code) : "",
      });
    }
    setLoading(false);
  };

  const onSave = async () => {
    setLoading(true);
    try {
      const value = data;
      if (!isParent2Visible) {
        value.parent2 = false;
        delete value.parent2Status;
        delete value.parent2FirstName;
        delete value.parent2LastName;
        delete value.parent2Email;
        delete value.parent2Phone;
      } else {
        value.parent2 = true;
      }
      const { ok, code, data: responseData } = await api.put(`/young/inscription2023/representants/save`, value);
      if (!ok) {
        setErrors({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
        setLoading(false);
        return;
      }
      dispatch(setYoung(responseData));
      toastr.success("Vos informations ont bien été enregistrées");
    } catch (e) {
      capture(e);
      setErrors({
        text: `Une erreur s'est produite`,
        subText: e?.code ? translate(e.code) : "",
      });
    }
    setLoading(false);
  };

  return (
    <>
      <Navbar onSave={onSave} />
      <div className="bg-[#f9f6f2] flex justify-center py-10">
        <div className="basis-[70%] mx-auto my-0">
          <div className="bg-white px-[102px] py-[60px]">
            <div className="w-full flex justify-between items-center mt-2">
              <h1 className="text-xl font-bold">Mes représentants légaux</h1>
              <a href={`${supportURL}/base-de-connaissance/je-minscris-et-indique-mes-representants-legaux`} target="_blank" rel="noreferrer">
                <QuestionMarkBlueCircle />
              </a>
            </div>
            <div className="text-[#666666] text-sm mt-2">Votre représentant(e) légal(e) recevra un lien pour consentir à votre participation au SNU.</div>
            <hr className="my-4 h-px bg-gray-200 border-0" />
            {errors?.text && <Error {...errors} onClose={() => setErrors({})} />}
            <FormRepresentant i={1} data={data} setData={setData} errors={errors} corrections={corrections} />
            <hr className="my-4 h-px bg-gray-200 border-0" />
            <div className="flex gap-4 items-center">
              <CheckBox checked={!isParent2Visible} onChange={(e) => setIsParent2Visible(!e)} />
              <div className="text-[#3A3A3A] text-sm flex-1">Je ne possède pas de second(e) représentant(e) légal(e)</div>
            </div>
            {isParent2Visible ? <FormRepresentant i={2} data={data} setData={setData} errors={errors} corrections={corrections} /> : null}
            <hr className="my-8 h-px bg-gray-200 border-0" />
            {young.status === YOUNG_STATUS.WAITING_CORRECTION ? (
              <div className="flex justify-end gap-4">
                <button className="flex items-center justify-center px-3 py-2 border-[1px] border-[#000091] text-[#000091] " onClick={() => history.push("/")}>
                  Précédent
                </button>
                <button
                  className={`flex items-center justify-center px-3 py-2 cursor-pointer ${loading ? "bg-[#E5E5E5] text-[#929292]" : "bg-[#000091] text-white"}`}
                  onClick={() => !loading && onCorrection()}>
                  Corriger
                </button>
              </div>
            ) : (
              <div className="flex justify-end gap-4">
                <button
                  className="flex items-center justify-center px-3 py-2 border-[1px] border-[#000091] text-[#000091] "
                  onClick={() => history.push("/inscription2023/consentement")}>
                  Précédent
                </button>
                <button
                  className={`flex items-center justify-center px-3 py-2 cursor-pointer ${loading ? "bg-[#E5E5E5] text-[#929292]" : "bg-[#000091] text-white"}`}
                  onClick={() => !loading && onSubmit()}>
                  Continuer
                </button>
              </div>
            )}
          </div>
          <div className="flex w-full mt-4">
            <Help />
          </div>
        </div>
      </div>
    </>
  );
}

const FormRepresentant = ({ i, data, setData, errors, corrections }) => {
  return (
    <div className="flex flex-col my-4">
      <div className="pb-2 text-[#161616] font-bold">Représentant légal {i} </div>
      <RadioButton
        label="Votre lien"
        options={parentsStatus}
        onChange={(e) => setData({ ...data, [`parent${i}Status`]: e })}
        value={data[`parent${i}Status`]}
        error={errors[`parent${i}Status`]}
        correction={corrections[`parent${i}Status`]}
      />
      <Input
        value={data[`parent${i}FirstName`]}
        label="Son prénom"
        onChange={(e) => setData({ ...data, [`parent${i}FirstName`]: e })}
        error={errors[`parent${i}FirstName`]}
        correction={corrections[`parent${i}FirstName`]}
      />
      <Input
        value={data[`parent${i}LastName`]}
        label="Son nom"
        onChange={(e) => setData({ ...data, [`parent${i}LastName`]: e })}
        error={errors[`parent${i}LastName`]}
        correction={corrections[`parent${i}LastName`]}
      />
      <Input
        value={data[`parent${i}Email`]}
        label="Son e-mail"
        onChange={(e) => setData({ ...data, [`parent${i}Email`]: e })}
        error={errors[`parent${i}Email`]}
        correction={corrections[`parent${i}Email`]}
      />
      <Input
        value={data[`parent${i}Phone`]}
        label="Son numéro de téléphone"
        onChange={(e) => setData({ ...data, [`parent${i}Phone`]: e })}
        error={errors[`parent${i}Phone`]}
        correction={corrections[`parent${i}Phone`]}
      />
    </div>
  );
};
