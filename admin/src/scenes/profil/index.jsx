import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { VISITOR_SUBROLES } from "snu-lib";
import Loader from "../../components/Loader";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { setUser } from "../../redux/auth/actions";
import api from "../../services/api";
import { getPasswordErrorMessage, REFERENT_DEPARTMENT_SUBROLE, REFERENT_REGION_SUBROLE, ROLES, translate, copyToClipboard } from "../../utils";
import ModalConfirm from "../../components/modals/ModalConfirm";
import ModalChangeTutor from "../../components/modals/ModalChangeTutor";
import ModalReferentDeleted from "../../components/modals/ModalReferentDeleted";
import ModalUniqueResponsable from "../utilisateur/composants/ModalUniqueResponsable";
import { capture } from "../../sentry";
import { BiCopy } from "react-icons/bi";
import { HiCheckCircle } from "react-icons/hi";

import Select from "../../components/TailwindSelect";
import Eye from "../../assets/icons/Eye";
import EyeSlash from "../../assets/EyeSlash";

import validator from "validator";

export default function Profil() {
  useDocumentTitle("Mon profil");

  const user = useSelector((state) => state.Auth.user);
  const dispatch = useDispatch();
  const history = useHistory();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [modalTutor, setModalTutor] = useState({ isOpen: false, onConfirm: null });
  const [modalUniqueResponsable, setModalUniqueResponsable] = useState({ isOpen: false });
  const [modalReferentDeleted, setModalReferentDeleted] = useState({ isOpen: false });

  const [values, setValues] = useState(user);
  const [rightValues, setRightValues] = useState({ password: "", newPassword: "", verifyPassword: "" });
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [loadingPassord, setLoadingPassord] = useState(false);

  const getSubRole = (role) => {
    let subRole = [];
    if (role === ROLES.REFERENT_DEPARTMENT) subRole = REFERENT_DEPARTMENT_SUBROLE;
    if (role === ROLES.REFERENT_REGION) subRole = REFERENT_REGION_SUBROLE;
    if (role === ROLES.VISITOR) subRole = VISITOR_SUBROLES;
    return Object.keys(subRole).map((e) => ({ value: e, label: translate(subRole[e]) }));
  };

  const onClickDelete = () => {
    setModal({
      isOpen: true,
      onConfirm: () => onConfirmDelete(),
      title: `Êtes-vous sûr(e) de vouloir supprimer le profil de ${user.firstName} ${user.lastName} ?`,
      message: "Cette action est irréversible.",
    });
  };

  const onConfirmDelete = async () => {
    try {
      const { ok, code } = await api.remove(`/referent/${user._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok && code === "LINKED_STRUCTURE") return onUniqueResponsible(user);
      if (!ok && code === "LINKED_MISSIONS") return onDeleteTutorLinked(user);
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      return onReferentDeleted();
    } catch (e) {
      capture(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression du profil :", translate(e.code));
    }
  };

  const onDeleteTutorLinked = (target) => {
    setModalTutor({
      isOpen: true,
      value: target,
      onConfirm: () => onConfirmDelete(target),
    });
  };

  const onUniqueResponsible = (target) => {
    setModalUniqueResponsable({
      isOpen: true,
      responsable: target,
    });
  };

  const onReferentDeleted = () => {
    setModalReferentDeleted({
      isOpen: true,
    });
  };

  const handleChange = (name, value) => {
    setValues({ ...values, [name]: value });
  };

  const handlePasswordChange = (name, value) => {
    setRightValues({ ...rightValues, [name]: value });
  };
  const onPasswordSubmit = async () => {
    const error = {};
    if (!rightValues?.password) error.password = "Le mot de passe est obligatoire";
    const validateNewPassword = getPasswordErrorMessage(rightValues?.newPassword);
    if (validateNewPassword) error.newPassword = validateNewPassword;
    if (!rightValues?.verifyPassword) error.verifyPassword = "La vérification du mot de passe est obligatoire";
    if (rightValues?.newPassword !== rightValues?.verifyPassword) error.verifyPassword = "Les mots de passe ne correspondent pas";
    setErrors(error);
    if (Object.keys(error).length > 0) return toastr.error("Le formulaire est incomplet");
    setErrors({});
    setLoadingPassord(true);
    try {
      const { ok, code, user } = await api.post("/referent/reset_password", rightValues);
      if (!ok) toastr.error("Une erreur s'est produite :", translate(code));
      dispatch(setUser(user));
      toastr.success("Mot de passe mis à jour!");
      setLoadingPassord(false);
      return history.push("/dashboard");
    } catch (e) {
      setLoadingPassord(false);
      console.log(e);
      toastr.error("Oups, une erreur est survenue pendant la mise à jour du mot de passe :", translate(e.code));
    }
  };

  const onSubmit = async () => {
    const error = {};
    if (!values?.lastName) error.lastName = "Le nom est obligatoire";
    if (!values?.firstName) error.firstName = "Le prénom est obligatoire";
    if (values?.phone && !validator.isMobilePhone(values.phone)) error.phone = "Le numéro de téléphone n'est pas valide";
    if (values?.mobile && !validator.isMobilePhone(values.mobile)) error.mobile = "Le numéro de téléphone n'est pas valide";
    if (!validator.isEmail(values.email)) error.email = "L'adresse email n'est pas valide";
    setErrors(error);
    if (Object.keys(error).length > 0) return toastr.error("Le formulaire est incomplet");
    setErrors({});
    setLoading(true);
    try {
      const { data, ok } = await api.put("/referent", values);
      if (ok) {
        dispatch(setUser(data));
        setValues(data);
        setLoading(false);
        return toastr.success("Profil mis à jour !");
      }
    } catch (e) {
      console.log(e);
    }
    setLoading(false);
    toastr.error("Erreur");
  };

  if (user === undefined) return <Loader />;
  return (
    <div className="m-8">
      <div className="mb-10 flex items-center gap-4">
        <h2 className="m-0 text-2xl font-bold text-brand-black">{`${user.firstName} ${user.lastName}`}</h2>
        <span className="rounded-full border !border-gray-400 bg-gray-100 px-3 py-1 text-sm text-gray-400">{translate(user.role)}</span>
      </div>
      <div className="flex w-full flex-col rounded-lg bg-white p-8 xl:flex-row">
        <div className="flex flex-1 flex-col gap-4">
          <div className="text-lg font-medium text-gray-900">Informations générales</div>
          <div className="text-xs font-medium">Identité et contact</div>
          <div className="flex flex-row items-center justify-between gap-4">
            <Field label="Nom" onChange={(e) => handleChange("lastName", e.target.value)} value={values.lastName} error={errors?.lastName} />
            <Field label="Prénom" onChange={(e) => handleChange("firstName", e.target.value)} value={values.firstName} error={errors?.firstName} />
          </div>
          {[ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.VISITOR].includes(values.role) ? (
            <Select label="Fonction" selected={values.subRole} setSelected={(e) => handleChange("subRole", e.value)} options={getSubRole(values.role)} />
          ) : null}
          {user.role === ROLES.REFERENT_DEPARTMENT ? <Field disabled label="Département" value={values.department} readOnly /> : null}
          {user.role === ROLES.REFERENT_REGION ? <Field disabled label="Région" value={values.region} readOnly /> : null}
          <Field label="Email" copy onChange={(e) => handleChange("email", e.target.value)} value={values.email} error={errors?.email} />
          <div className="flex flex-row items-center justify-between gap-4">
            <Field label="Téléphone mobile (facultatif)" onChange={(e) => handleChange("mobile", e.target.value)} value={values.mobile} error={errors?.mobile} />
            <Field label="Téléphone fixe (facultatif)" onChange={(e) => handleChange("phone", e.target.value)} value={values.phone ? values.phone : ""} error={errors?.phone} />
          </div>
          <div className="mt-4 flex w-full flex-row items-center gap-4 text-center text-sm font-medium">
            {loading ? (
              <div className="flex h-[38px] w-full items-center justify-center">
                <Loader />
              </div>
            ) : (
              <>
                <div
                  className="flex-1 cursor-pointer rounded-md border-[1px] border-gray-300 py-2"
                  onClick={() => {
                    setValues({ ...user });
                    setErrors({});
                  }}>
                  Annuler
                </div>
                <div className="flex-1 cursor-pointer rounded-md border-[1px] bg-blue-600 py-2 text-white" onClick={onSubmit}>
                  Enregistrer
                </div>
              </>
            )}
          </div>
        </div>

        <div className="hidden items-center justify-center px-[56px] xl:flex">
          <div className="h-4/5 w-[1px] border-r-[1px] border-gray-300"></div>
        </div>

        <div className="mt-8 flex flex-1 flex-col gap-4 xl:mt-0">
          <div className="text-lg font-medium text-gray-900">Mot de passe</div>
          <div className="text-xs font-medium">Mon mot de passe</div>
          <Field label="Actuel" eye onChange={(e) => handlePasswordChange("password", e.target.value)} value={rightValues.password} error={errors?.password} />
          <Field
            label="Nouveau mot de passe"
            eye
            onChange={(e) => handlePasswordChange("newPassword", e.target.value)}
            value={rightValues.newPassword}
            error={errors?.newPassword}
          />
          <Field
            label="Confirmer le nouveau mot de passe"
            eye
            onChange={(e) => handlePasswordChange("verifyPassword", e.target.value)}
            value={rightValues.verifyPassword}
            error={errors?.verifyPassword}
          />
          <div className="mt-4 flex w-full flex-row items-center gap-4 text-center text-sm font-medium">
            {loadingPassord ? (
              <div className="flex h-[38px] w-full items-center justify-center">
                <Loader />
              </div>
            ) : (
              <>
                <div
                  className="flex-1 cursor-pointer rounded-md border-[1px] border-gray-300 py-2"
                  onClick={() => {
                    setRightValues({ password: "", newPassword: "", verifyPassword: "" });
                    setErrors({});
                  }}>
                  Annuler
                </div>
                <div className="flex-1 cursor-pointer rounded-md border-[1px] bg-blue-600 py-2 text-white" onClick={onPasswordSubmit}>
                  Valider mon nouveau mot de passe
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="my-8 flex items-center justify-center">
        <div className="tex-center w-fit cursor-pointer self-center rounded-md border-[1px] border-red-500 p-2 text-red-500" onClick={onClickDelete}>
          Supprimer mon compte
        </div>
      </div>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
      <ModalChangeTutor
        isOpen={modalTutor?.isOpen}
        title={modalTutor?.title}
        message={modalTutor?.message}
        tutor={modalTutor?.value}
        onCancel={() => setModalTutor({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modalTutor?.onConfirm();
          setModalTutor({ isOpen: false, onConfirm: null });
        }}
      />
      <ModalUniqueResponsable
        isOpen={modalUniqueResponsable?.isOpen}
        responsable={modalUniqueResponsable?.responsable}
        onConfirm={() => setModalUniqueResponsable({ isOpen: false })}
      />
      <ModalReferentDeleted isOpen={modalReferentDeleted?.isOpen} onConfirm={() => history.push("/user")} />
    </div>
  );
}

const Field = ({ onChange, value, label, disabled = false, error, readOnly = false, copy, className = "", eye = null }) => {
  const [copied, setCopied] = React.useState(false);
  const [eyeVisible, setEyeVisible] = React.useState(false);
  React.useEffect(() => {
    if (copied) {
      setTimeout(() => setCopied(false), 3000);
    }
  }, [copied]);

  return (
    <div
      key={label}
      className={`flex w-full flex-col rounded-lg border-[1px] border-gray-300 py-2 px-2.5 ${disabled ? "bg-gray-100" : ""} ${error ? "border-red-500" : ""} ${className}`}>
      <label className="text-xs leading-4 text-gray-500">{label}</label>
      <div className="flex items-center gap-2">
        {copy && value && (
          <div
            className={`flex items-center justify-center hover:scale-105`}
            onClick={() => {
              copyToClipboard(value);
              setCopied(true);
            }}>
            {copied ? <HiCheckCircle className="h-4 w-4 text-green-500" /> : <BiCopy className="h-4 w-4 text-gray-400" />}
          </div>
        )}
        <input
          type={eye && !eyeVisible ? "password" : "text"}
          className={`w-full ${disabled ? "bg-gray-100" : ""} ${readOnly && "cursor-default"}`}
          value={value}
          // to avoid chrome autocomplete
          autoComplete="new-password"
          onChange={onChange}
          disabled={disabled}
          readOnly={readOnly}
        />
        {eye && (
          <>
            {eyeVisible ? (
              <Eye className="text-gray-500" onClick={() => setEyeVisible(!eyeVisible)} />
            ) : (
              <EyeSlash className="text-gray-500" onClick={() => setEyeVisible(!eyeVisible)} />
            )}
          </>
        )}
      </div>

      {error && <div className="text-[#EF4444]">{error}</div>}
    </div>
  );
};
