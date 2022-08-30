import { Field, Formik } from "formik";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { VISITOR_SUBROLES } from "snu-lib/roles";
import LoadingButton from "../../components/buttons/LoadingButton";
import CustomMultiSelect from "../../components/CustomMultiSelect";
import { requiredMessage } from "../../components/errorMessage";
import Loader from "../../components/Loader";
import PasswordEye from "../../components/PasswordEye";
import useDocumentTitle from "../../hooks/useDocumentTitle";
import { setUser } from "../../redux/auth/actions";
import api from "../../services/api";
import { getPasswordErrorMessage, REFERENT_DEPARTMENT_SUBROLE, REFERENT_REGION_SUBROLE, ROLES, translate } from "../../utils";

export default function Profil() {
  useDocumentTitle("Mon profil");

  const user = useSelector((state) => state.Auth.user);
  const dispatch = useDispatch();
  const history = useHistory();

  const getSubRole = (role) => {
    let subRole = [];
    if (role === ROLES.REFERENT_DEPARTMENT) subRole = REFERENT_DEPARTMENT_SUBROLE;
    if (role === ROLES.REFERENT_REGION) subRole = REFERENT_REGION_SUBROLE;
    if (role === ROLES.VISITOR) subRole = VISITOR_SUBROLES;
    return Object.keys(subRole).map((e) => ({ value: e, label: translate(subRole[e]) }));
  };

  const getDepartment = (role) => {
    if (role !== ROLES.REFERENT_DEPARTMENT) return;
    return user.department.map((e) => ({ value: e, label: e }));
  };

  if (user === undefined) return <Loader />;

  return (
    <div className="py-5 px-10">
      {/* <p className="mb-4 text-lg font-medium uppercase text-brand-grey">Mon profil</p> */}
      <div className="mb-10 flex items-center gap-4">
        <h2 className="text-2xl font-bold text-brand-black m-0">{`${user.firstName} ${user.lastName}`}</h2>
        <span className="rounded-full border !border-gray-400 bg-gray-100 px-3 py-1 text-sm text-gray-400">{translate(user.role)}</span>
      </div>
      <div className="flex gap-8">
        <div className="flex-1">
          <Formik
            initialValues={user}
            onSubmit={async (values, actions) => {
              try {
                const { data, ok } = await api.put("/referent", values);
                if (ok) {
                  dispatch(setUser(data));
                  return toastr.success("Profil mis à jour !");
                }
              } catch (e) {
                console.log(e);
              }
              toastr.error("Erreur");
              actions.setSubmitting(false);
            }}>
            {({ values, errors, touched, isSubmitting, handleChange, handleSubmit }) => (
              <>
                <div className="rounded-md bg-white shadow-md">
                  <div className="border-b border-gray-200 px-8 py-6">
                    <h3 className="text-lg font-bold text-gray-800">Informations générales</h3>
                    <p className="italic text-gray-400">Données personnelles</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 p-8">
                    <Item
                      className="col-span-2"
                      required
                      title="E-mail"
                      values={values}
                      name="email"
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                      type={"text"}
                      validate={(v) => !v && requiredMessage}
                    />
                    {user.role === ROLES.REFERENT_DEPARTMENT ? (
                      <MultiSelect
                        name="department"
                        required
                        onChange={handleChange}
                        placeholder="Sélectionnez le(s) département(s)..."
                        title="Département"
                        options={getDepartment(values.role)}
                        validate={(v) => !v.length && requiredMessage}
                        disabled
                      />
                    ) : null}
                    {user.role === ROLES.REFERENT_REGION ? <Item title="Région" disabled values={values} name="region" handleChange={handleChange} type={"text"} /> : null}
                    <Item
                      required
                      title="Prénom"
                      values={values}
                      name="firstName"
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                      type={"text"}
                      validate={(v) => !v && requiredMessage}
                    />
                    <Item
                      required
                      title="Nom"
                      values={values}
                      name="lastName"
                      handleChange={handleChange}
                      errors={errors}
                      touched={touched}
                      type={"text"}
                      validate={(v) => !v && requiredMessage}
                    />
                    <Item title="Téléphone mobile" values={values} name="mobile" handleChange={handleChange} type={"text"} />
                    <Item title="Téléphone fixe" values={values} name="phone" handleChange={handleChange} type={"text"} />
                    {[ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.VISITOR].includes(values.role) ? (
                      <Select name="subRole" values={values} onChange={handleChange} title="Fonction" options={getSubRole(values.role)} />
                    ) : null}
                    <LoadingButton className="w-full max-w-xs" loading={isSubmitting} onClick={handleSubmit}>
                      Enregistrer
                    </LoadingButton>
                  </div>
                </div>
              </>
            )}
          </Formik>
        </div>
        <div className="flex-1">
          <Formik
            initialValues={{ password: "", newPassword: "", verifyPassword: "" }}
            validateOnChange={false}
            validateOnBlur={false}
            onSubmit={async ({ password, verifyPassword, newPassword }) => {
              try {
                const { ok, code, user } = await api.post("/referent/reset_password", { password, verifyPassword, newPassword });
                if (!ok) toastr.error("Une erreur s'est produite :", translate(code));
                dispatch(setUser(user));
                toastr.success("Mot de passe mis à jour!");
                return history.push("/dashboard");
              } catch (e) {
                console.log(e);
                toastr.error("Oups, une erreur est survenue pendant la mise à jour du mot de passe :", translate(e.code));
              }
            }}>
            {({ values, handleChange, handleSubmit, isSubmitting, errors, touched }) => (
              <div className="rounded-md bg-white shadow-md">
                <div className="border-b border-gray-200 px-8 py-6">
                  <h3 className="text-lg font-bold text-gray-800">Mot de passe</h3>
                  <p className="italic text-gray-400">Modifier votre mot de passe</p>
                </div>
                <div className="flex flex-col gap-4 p-8">
                  <Item required name="password" title="Actuel" errors={errors} touched={touched}>
                    <PasswordEye
                      type="password"
                      validate={(v) => (!v && requiredMessage) || getPasswordErrorMessage(v)}
                      placeholder=""
                      name="password"
                      value={values.password}
                      onChange={handleChange}
                    />
                  </Item>
                  <Item required name="newPassword" title="Nouveau" errors={errors} touched={touched}>
                    <PasswordEye type="password" validate={getPasswordErrorMessage} placeholder="" name="newPassword" value={values.newPassword} onChange={handleChange} />
                  </Item>
                  <Item required name="verifyPassword" title="Confirmer" errors={errors} touched={touched}>
                    <PasswordEye
                      type="password"
                      title="Confirmer"
                      placeholder=""
                      validate={(v) => (!v && requiredMessage) || (v !== values.newPassword && "Les mots de passe renseignés ne sont pas identiques")}
                      name="verifyPassword"
                      value={values.verifyPassword}
                      onChange={handleChange}
                    />
                  </Item>
                  <LoadingButton className="w-full max-w-xs" onClick={handleSubmit} disabled={isSubmitting}>
                    Valider mon nouveau mot de passe
                  </LoadingButton>
                </div>
              </div>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
}

const Select = ({ title, name, values, onChange, disabled, options, className }) => {
  return (
    <div className={className}>
      <label className="mb-2 inline-block text-xs uppercase text-brand-grey">{title}</label>
      <select
        disabled={disabled}
        className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
        name={name}
        value={values[name]}
        onChange={onChange}>
        <option key={-1} value="" label=""></option>
        {options.map((o, i) => (
          <option key={i} value={o.value} label={o.label}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const Item = ({ title, values, name, handleChange, disabled, required, errors, touched, type, validate, children, className }) => {
  return (
    <div className={className}>
      <label className="mb-2 inline-block text-xs uppercase text-brand-grey">
        {required && <span className="text-red-500 mr-1">*</span>}
        {title}
      </label>
      {children || (
        <Field
          disabled={disabled}
          className="block w-full rounded border border-brand-lightGrey bg-white py-2.5 px-4 text-sm text-brand-black/80 outline-0 transition-colors placeholder:text-brand-black/25 focus:border-brand-grey"
          value={translate(values[name])}
          name={name}
          onChange={handleChange}
          type={type}
          validate={validate}
        />
      )}
      {errors && touched && <p className="text-xs text-red-500" errors={errors} touched={touched} name={name} />}
    </div>
  );
};

const MultiSelect = ({ title, required, name, placeholder, disabled, options, className, validate }) => {
  return (
    <div className={className}>
      <label className="mb-2 inline-block text-xs uppercase text-brand-grey">
        {required && <span className="text-red-500 mr-1">*</span>}
        {title}
      </label>
      <Field name={name} options={options} component={CustomMultiSelect} placeholder={placeholder} disabled={disabled} validate={validate} />
    </div>
  );
};
