import React, { useState } from "react";
import { Row, Col } from "reactstrap";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Field, Formik } from "formik";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";
import api from "../services/api";
import { setYoung } from "../redux/auth/actions";
import ErrorMessage, { requiredMessage } from "../scenes/inscription2023/components/ErrorMessageOld";
import { getPasswordErrorMessage, translate, putLocation } from "../utils";
import validator from "validator";
import AddressInputV2 from "../components/addressInputV2";
import ModalConfirm from "../components/modals/ModalConfirm";
import PasswordEye from "../components/PasswordEye";
import { appURL } from "../config";

export default function Account() {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const history = useHistory();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  const updateYoung = async (values) => {
    try {
      if (!values.location || !values.location.lat || !values.location.lon) {
        values.location = await putLocation(values.city, values.zip);
      }
      const { ok, code, data: young } = await api.put("/young", values);
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      dispatch(setYoung(young));
      toastr.success("Mis à jour!");
      return history.push("/");
    } catch (e) {
      console.log(e);
      toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
    }
  };

  return (
    <Wrapper>
      <Heading>
        <span>{`${young.firstName} ${young.lastName}`}</span>
        <h1>Mes paramètres</h1>
      </Heading>
      <Formik
        initialValues={young}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          try {
            const { ok, code, data: young } = await api.put("/young", values);
            if (!ok) {
              if (code === "USER_ALREADY_REGISTERED")
                return toastr.error("Cet identifiant est déjà utilisé, pour plus d'informations contactez le support : contact@snu.gouv.fr ", { timeOut: 10000 });
              return toastr.error("Une erreur s'est produite :", translate(code));
            }
            dispatch(setYoung(young));
            toastr.success("Mis à jour!");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
          }
        }}>
        {({ values, handleChange, handleSubmit, isSubmitting, errors, touched }) => (
          <>
            <h2 className="md:text-3xl  text-2xl font-bold mb-6">Email</h2>
            <FormRow>
              <Item
                name="email"
                values={values}
                handleChange={handleChange}
                title="E-mail"
                validate={(v) => (!v && requiredMessage) || (!validator.isEmail(v) && "Ce champ est au mauvais format")}
                errors={errors}
                touched={touched}
              />
              <ContinueButton style={{ marginLeft: 10 }} onClick={handleSubmit} disabled={isSubmitting}>
                Enregistrer
              </ContinueButton>
            </FormRow>
          </>
        )}
      </Formik>
      <Formik
        initialValues={{ password: "", newPassword: "", verifyPassword: "" }}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async ({ password, verifyPassword, newPassword }) => {
          try {
            const { ok, code, user } = await api.post("/young/reset_password", { password, verifyPassword, newPassword });
            if (!ok) toastr.error("Une erreur s'est produite :", translate(code));
            dispatch(setYoung(user));
            toastr.success("Mot de passe mis à jour!");
            return history.push("/");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant la mise à jour du mot de passe :", translate(e.code));
          }
        }}>
        {({ values, handleChange, handleSubmit, isSubmitting, errors, touched }) => (
          <>
            <h2 className="md:text-3xl  text-2xl font-bold mb-6">Mot de passe</h2>
            <hr />
            <Item required name="password" title="Actuel" errors={errors} touched={touched}>
              <PasswordEye
                type="password"
                validate={getPasswordErrorMessage}
                placeholder=""
                name="password"
                // eslint-disable-next-line react/jsx-no-duplicate-props
                validate={(v) => !v && requiredMessage}
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
            <div style={{ marginLeft: -15 }}></div>
            <ContinueButton onClick={handleSubmit} disabled={isSubmitting} style={{ margin: "2rem 0" }}>
              Valider mon nouveau mot de passe
            </ContinueButton>
          </>
        )}
      </Formik>

      <Formik
        initialValues={young}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          if (young.address !== values.address || young.city !== values.city || young.department !== values.department || young.region !== values.region) {
            return setModal({
              isOpen: true,
              title: "J’ai déménagé",
              message: (
                <p>
                  <b>Attention, vous êtes sur le point de déclarer un déménagement.</b>
                  <br />
                  Votre référent départemental recevra un mail.
                  <br />
                  <br />
                  <i>
                    Si vous souhaitez accéder à une autre zone de recherche pour la proposition des missions, vous pouvez renseigner l&apos;adresse d’un proche dans{" "}
                    <a className="text-snu-purple-200 transition-colors hover:text-snu-purple-600 hover:underline" href={`${appURL}/preferences`} target="_blank" rel="noreferrer">
                      vos préférences
                    </a>{" "}
                    de missions.
                  </i>
                </p>
              ),
              onConfirm: async () => updateYoung(values),
            });
          } else updateYoung(values);
        }}>
        {({ values, handleChange, handleSubmit, isSubmitting, errors, touched, validateField }) => (
          <>
            <h2 className="md:text-3xl  text-2xl font-bold mb-6">Mon profil</h2>
            <FormRow>
              <Item name="firstName" values={values} handleChange={handleChange} title="Prénom" disabled />
              <Item name="lastName" values={values} handleChange={handleChange} title="Nom" disabled />
              <Select
                name="gender"
                values={values}
                handleChange={handleChange}
                title="Sexe"
                options={[
                  { value: "male", label: "Masculin" },
                  { value: "female", label: "Feminin" },
                ]}
              />
              <Item
                name="phone"
                values={values}
                handleChange={handleChange}
                title="Téléphone"
                validate={(v) => v && !validator.isMobilePhone(v, "fr-FR") && "Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX"}
                errors={errors}
              />
            </FormRow>
            <div style={{ marginBottom: "1.5rem" }}>
              <AddressInputV2
                countryByDefault="France"
                keys={{ city: "city", zip: "zip", address: "address", location: "location", department: "department", region: "region", country: "country" }}
                values={values}
                handleChange={handleChange}
                errors={errors}
                touched={touched}
                validateField={validateField}
              />
            </div>
            <h2 className="md:text-3xl  text-2xl font-bold mb-6">Représentant Légal</h2>
            <FormRow>
              <Select
                name="parent1Status"
                values={values}
                handleChange={handleChange}
                title="Statut du représentant légal 1"
                options={[
                  { value: "mother", label: "Mère" },
                  { value: "father", label: "Père" },
                  { value: "representant", label: "Représentant légal" },
                ]}
              />
              <Item name="parent1FirstName" values={values} handleChange={handleChange} title="Prénom" validate={(v) => !v && requiredMessage} errors={errors} />
              <Item name="parent1LastName" values={values} handleChange={handleChange} title="Nom" validate={(v) => !v && requiredMessage} errors={errors} />
              <Item
                name="parent1Email"
                values={values}
                handleChange={handleChange}
                title="E-mail"
                validate={(v) => (!v && requiredMessage) || (!validator.isEmail(v) && "Ce champ est au mauvais format")}
                errors={errors}
              />
              <Item
                name="parent1Phone"
                values={values}
                handleChange={handleChange}
                title="Téléphone"
                validate={(v) =>
                  (!v && requiredMessage) || (!validator.isMobilePhone(v, "fr-FR") && "Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX")
                }
                errors={errors}
              />
            </FormRow>
            <FormRow>
              <Select
                name="parent2Status"
                values={values}
                handleChange={handleChange}
                title="Statut du représentant légal 2 (facultatif)"
                options={[
                  { value: undefined, label: "Aucun" },
                  { value: "mother", label: "Mère" },
                  { value: "father", label: "Père" },
                  { value: "representant", label: "Représentant légal" },
                ]}
              />
              <Item name="parent2FirstName" values={values} handleChange={handleChange} title="Prénom" />
              <Item name="parent2LastName" values={values} handleChange={handleChange} title="Nom" />
              <Item
                name="parent2Email"
                values={values}
                handleChange={handleChange}
                title="E-mail"
                validate={(v) => v && !validator.isEmail(v) && "Ce champ est au mauvais format"}
                errors={errors}
              />
              <Item
                name="parent2Phone"
                values={values}
                handleChange={handleChange}
                title="Téléphone"
                validate={(v) => v && !validator.isMobilePhone(v, "fr-FR") && "Le numéro de téléphone est au mauvais format. Format attendu : 06XXXXXXXX ou +33XXXXXXXX"}
                errors={errors}
              />
            </FormRow>
            <ContinueButton onClick={handleSubmit} disabled={isSubmitting}>
              Enregistrer
            </ContinueButton>
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
          </>
        )}
      </Formik>
    </Wrapper>
  );
}

const Item = ({ title, name, values, handleChange, errors, touched, validate, type, children, ...props }) => {
  return (
    <Col md={4} style={{ marginTop: 20 }}>
      <Label>{title}</Label>
      {children || <Field type={type} className="form-control" name={name} value={values[name]} onChange={handleChange} validate={validate} {...props} />}
      {errors && <ErrorMessage errors={errors} touched={touched} name={name} />}
    </Col>
  );
};

const Select = ({ title, name, values, handleChange, errors, touched, validate, options }) => {
  return (
    <Col md={4} style={{ marginTop: 20 }}>
      <Label>{title}</Label>
      <select className="form-control" name={name} value={values[name]} onChange={handleChange} validate={validate}>
        {options.map((o, i) => (
          <option key={i} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {errors && <ErrorMessage errors={errors} touched={touched} name={name} />}
    </Col>
  );
};

const Wrapper = styled.div`
  padding: 20px 40px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
`;
const Heading = styled.div`
  margin-bottom: 30px;
  span {
    color: #42389d;
    font-size: 1rem;
    font-weight: 700;
    margin-bottom: 5px;
  }
  h1 {
    color: #161e2e;
    margin-bottom: 0;
    font-size: 3rem;
    @media (max-width: 767px) {
      font-size: 1.8rem;
    }
    font-weight: 800;
  }
`;

const FormRow = styled(Row)`
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
  padding-bottom: 20px;
  align-items: ${({ align }) => align};
  text-align: left;
  input[type="text"] {
    max-width: 500px;
  }
  margin-bottom: 40px;
`;

const Label = styled.div`
  color: #374151;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 5px;
`;

const ContinueButton = styled.button`
  @media (max-width: 767px) {
    margin: 1rem 0;
  }
  color: #fff;
  background-color: #5145cd;
  padding: 10px 40px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  font-weight: 600;
  font-size: 14px;
  display: block;
  width: auto;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  align-self: flex-end;
  :hover {
    opacity: 0.9;
  }
`;
