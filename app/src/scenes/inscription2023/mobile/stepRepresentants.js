import React from "react";
import { AiOutlinePlus } from "react-icons/ai";
import { HiOutlineTrash } from "react-icons/hi";
import { useSelector, useDispatch } from "react-redux";
import { Link, useHistory } from "react-router-dom";
import validator from "validator";
import QuestionMarkBlueCircle from "../../../assets/icons/QuestionMarkBlueCircle";
import StickyButton from "../../../components/inscription/stickyButton";
import Input from "../components/Input";
import { translate } from "../../../utils";
import { capture } from "../../../sentry";
import api from "../../../services/api";
import { setYoung } from "../../../redux/auth/actions";
import Error from "../../../components/error";
import Navbar from "../components/Navbar";

export default function StepRepresentants({ step }) {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const parent1Keys = ["parent1Status", "parent1FirstName", "parent1LastName", "parent1Email", "parent1Phone"];
  const parent2Keys = ["parent2Status", "parent2FirstName", "parent2LastName", "parent2Email", "parent2Phone"];
  const [loading, setLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [isParent2Visible, setIsParent2Visible] = React.useState(false);
  const dispatch = useDispatch();

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

  const hasParent2Infos = () => {
    return young?.parent2Status || young?.parent2FirstName || young?.parent2LastName || young?.parent2Email || young?.parent2Phone ? true : false;
  };

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
      setIsParent2Visible(hasParent2Infos());
    }
  }, [young]);

  const getErrors = () => {
    let errors = {};
    if (data.parent1Phone && !validator.isMobilePhone(data.parent1Phone)) {
      errors.parent1Phone = "Le numéro de téléphone est au mauvais format.";
    } else errors.parent1Phone = undefined;
    if (data.parent1Email && !validator.isEmail(data.parent1Email)) {
      errors.parent1Email = "L'adresse email n'est pas valide";
    } else errors.parent1Email = undefined;
    if (data.parent2Phone && !validator.isMobilePhone(data.parent2Phone)) {
      errors.parent2Phone = "Le numéro de téléphone est au mauvais format.";
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
        value.parent2 = true;
        const { ok, code, data: responseData } = await api.put(`/young/inscription2023/representants/next`, value);
        if (!ok) {
          setErrors({ text: `Une erreur s'est produite`, subText: code ? translate(code) : "" });
          setLoading(false);
          return;
        }
        dispatch(setYoung(responseData));
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

  //TO DO
  const onSave = () => {};

  return (
    <>
      <Navbar step={step} onSave={onSave} />
      <div className="bg-white p-4 text-[#161616]">
        <div className="w-full flex justify-between items-center mt-2">
          <h1 className="text-xl font-bold">Mes représentants légaux</h1>
          <Link to="/public-besoin-d-aide/">
            <QuestionMarkBlueCircle />
          </Link>
        </div>
        <div className="text-[#666666] text-sm mt-2">Votre représentant(e) légal(e) recevra un lien pour consentir à votre participation au SNU.</div>
        <hr className="my-4 h-px bg-gray-200 border-0" />
        {errors?.text && <Error {...errors} onClose={() => setErrors({})} />}
        <FormRepresentant i={1} data={data} setData={setData} errors={errors} />
        {isParent2Visible ? (
          <>
            <hr className="h-px bg-gray-200 border-0" />
            <FormRepresentant i={2} data={data} setData={setData} errors={errors} />
            <div className="flex justify-end gap-2 items-center text-[#000091]" onClick={() => setIsParent2Visible(false)}>
              <HiOutlineTrash />
              Supprimer le représentant légal
            </div>
          </>
        ) : (
          <div className="flex justify-end gap-2 items-center text-[#000091]" onClick={() => setIsParent2Visible(true)}>
            <AiOutlinePlus />
            Ajouter un(e) représentant(e) légal(e)
          </div>
        )}
      </div>
      <StickyButton text="Continuer" onClickPrevious={() => history.push("/inscription2023/consentement")} onClick={onSubmit} disabled={loading} />
    </>
  );
}

const FormRepresentant = ({ i, data, setData, errors }) => {
  return (
    <div className="flex flex-col my-4">
      <div className="pb-2 text-[#161616] font-bold">Représentant légal {i} </div>
      <div className="flex flex-col gap-2">
        <div className="text-[#161616] text-base">Votre lien</div>
        <div className="flex items-center">
          <label className="flex items-center mb-0 border-r-[1px] pr-4">
            <input
              className="mr-3 accent-[#000091] border-dashed h-5 w-5"
              type="radio"
              checked={data[`parent${i}Status`] === "mother"}
              onChange={() => setData({ ...data, [`parent${i}Status`]: "mother" })}
            />
            Mère
          </label>
          <label className="flex items-center pl-4 mb-0">
            <input
              className="mr-3 accent-[#000091] border-dashed h-5 w-5"
              type="radio"
              checked={data[`parent${i}Status`] === "father"}
              onChange={() => setData({ ...data, [`parent${i}Status`]: "father" })}
            />
            Père
          </label>
        </div>
        <label className="flex items-center mb-0">
          <input
            className="mr-3 accent-[#000091] border-dashed h-5 w-5"
            type="radio"
            checked={data[`parent${i}Status`] === "representant"}
            onChange={() => setData({ ...data, [`parent${i}Status`]: "representant" })}
          />
          Représentant(e) légal(e)
        </label>
        <div className="text-[#CE0500] text-sm">{errors[`parent${i}Status`]}</div>
      </div>
      <Input value={data[`parent${i}FirstName`]} label="Son prénom" onChange={(e) => setData({ ...data, [`parent${i}FirstName`]: e })} error={errors[`parent${i}FirstName`]} />
      <Input value={data[`parent${i}LastName`]} label="Son nom" onChange={(e) => setData({ ...data, [`parent${i}LastName`]: e })} error={errors[`parent${i}LastName`]} />
      <Input value={data[`parent${i}Email`]} label="Son e-mail" onChange={(e) => setData({ ...data, [`parent${i}Email`]: e })} error={errors[`parent${i}Email`]} />
      <Input value={data[`parent${i}Phone`]} label="Son numéro de téléphone" onChange={(e) => setData({ ...data, [`parent${i}Phone`]: e })} error={errors[`parent${i}Phone`]} />
    </div>
  );
};
