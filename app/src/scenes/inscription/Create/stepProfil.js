import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Row, Col } from "reactstrap";
import { Field, Formik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import validator from "validator";
import { toastr } from "react-redux-toastr";
import { Helmet } from "react-helmet";
import DateInput from "../components/dateInput";
import { getPasswordErrorMessage, translate } from "../../../utils";

import ErrorMessage, { requiredMessage } from "../components/errorMessage";

import { setYoung } from "../../../redux/auth/actions";

import matomo from "../../../services/matomo";
import api from "../../../services/api";

import { YOUNG_STATUS, YOUNG_PHASE } from "../../../utils";

import EyeOpen from "../../../assets/eye.svg";
import EyeClose from "../../../assets/eye-slash.svg";

export default () => {
  useEffect(() => {
    matomo.logEvent("inscription", "open_step", "step", 0);
    window.lumiere("sendEvent", "inscription", "open_step", { step: 0 });
  }, []);
  const [passwordText, setPasswordText] = useState(false);
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young) || { frenchNationality: "", firstName: "", lastName: "", birthdateAt: "", email: "", password: "", repassword: "" };
  const history = useHistory();

  return (
    <Wrapper>
      <Helmet>
        <script>{`
          gtag('event', 'conversion', {
            'allow_custom_scripts': true,
            'send_to': 'DC-3452220/servi0/snu21f+unique'
          });`}</script>
        <noscript>{`<img src="https://ad.doubleclick.net/ddm/activity/src=3452220;type=servi0;cat=snu21f;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;npa=;gdpr=\${GDPR};gdpr_consent=\${GDPR_CONSENT_755};ord=1;num=1?" width="1" height="1" alt=""/>`}</noscript>
        <script>{`
          gtag('event', 'conversion', {
            'allow_custom_scripts': true,
            'send_to': 'DC-2971054/snuiz0/inscsnu+unique'
          });`}</script>
        <noscript>{`<img src="https://ad.doubleclick.net/ddm/activity/src=2971054;type=snuiz0;cat=inscsnu;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;npa=;gdpr=\${GDPR};gdpr_consent=\${GDPR_CONSENT_755};ord=1;num=1?" width="1" height="1" alt=""/>`}</noscript>
      </Helmet>
      <Heading>
        <h2>Création du profil du volontaire</h2>
        <p>Renseignez ci-dessous les coordonnées du volontaire</p>
      </Heading>
      <Formik
        initialValues={young}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          try {
            const { user, token, code, ok } = await api.post(`/young/signup`, values);
            if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
            if (token) api.setToken(token);

            const newValues = { ...values, ...user };
            newValues.historic = [
              {
                phase: YOUNG_PHASE.INSCRIPTION,
                createdAt: Date.now(),
                userName: `${newValues.firstName} ${newValues.lastName}`,
                userId: newValues._id,
                status: YOUNG_STATUS.IN_PROGRESS,
                note: "",
              },
            ];
            const { ok: okPut, code: codePut, data: young } = await api.put("/young", newValues);
            if (!okPut) return toastr.error("Une erreur s'est produite :", codePut);
            dispatch(setYoung(young));
            matomo.setUserId(young._id);
            window.lumiere("registerUser", young._id);
            history.push("/inscription/coordonnees");
          } catch (e) {
            console.log(e);
            if (e.code === "USER_ALREADY_REGISTERED") return toastr.error("Cet email est déjà utilisé.", "Merci de vous connecter pour continuer votre inscription.");
            return toastr.error("Oups, une erreur est survenue pendant le traitement du formulaire :", translate(e.code));
          }
        }}
      >
        {({ values, handleChange, handleSubmit, setFieldValue, isSubmitting, submitForm, errors, touched }) => (
          <>
            <FormRow>
              <Col md={4}>
                <Label>Votre nationalité</Label>
              </Col>
              <Col>
                <RadioLabel>
                  <Field
                    validate={(v) => (!v || v === "false") && "Vous devez être de nationalité française pour vous inscrire au SNU."}
                    value="true"
                    checked={values.frenchNationality === "true"}
                    type="checkbox"
                    name="frenchNationality"
                    onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.checked ? "true" : "false" } })}
                  />
                  Française
                </RadioLabel>
                <div style={{ fontSize: 14, fontWeight: 400, maxWidth: 500, color: "#6b7280" }}>Seuls les citoyens français peuvent participer au Service National Universel</div>
                <ErrorMessage errors={errors} touched={touched} name="frenchNationality" />
              </Col>
            </FormRow>
            <FormRow align="center">
              <Col md={4}>
                <Label>Votre prénom</Label>
              </Col>
              <Col>
                <Field placeholder="Prénom" className="form-control" validate={(v) => !v && requiredMessage} name="firstName" value={values.firstName} onChange={handleChange} />
                <ErrorMessage errors={errors} touched={touched} name="firstName" />
              </Col>
            </FormRow>
            <FormRow align="center">
              <Col md={4}>
                <Label>Votre nom</Label>
              </Col>
              <Col>
                <Field placeholder="Nom" className="form-control" validate={(v) => !v && requiredMessage} name="lastName" value={values.lastName} onChange={handleChange} />
                <ErrorMessage errors={errors} touched={touched} name="lastName" />
              </Col>
            </FormRow>
            <FormRow align="center">
              <Col md={4}>
                <Label>Date de naissance</Label>
              </Col>
              <Col>
                <Field
                  hidden
                  validate={(v) => {
                    if (!v) return requiredMessage;
                    var from = new Date(2003, 6, 2); // -1 because months are from 0 to 11
                    var to = new Date(2006, 3, 20);
                    const [y, m, d] = v.substring(0, 10).split("-");
                    var check = new Date(Date.UTC(parseInt(y), parseInt(m - 1), parseInt(d)));
                    return (check < from || check > to) && "Vous n'avez pas l'âge requis pour vous inscrire au SNU";
                  }}
                  name="birthdateAt"
                  value={values.birthdateAt}
                />
                <DateInput
                  value={values.birthdateAt}
                  onChange={(date) => {
                    handleChange({ target: { value: date, name: "birthdateAt" } });
                  }}
                />
                <ErrorMessage errors={errors} touched={touched} name="birthdateAt" />
              </Col>
            </FormRow>
            <FormRow align="center">
              <Col md={4}>
                <Label>Votre e-mail</Label>
              </Col>
              <Col>
                <Field
                  placeholder="xxx@exemple.com"
                  className="form-control"
                  validate={(v) => (!v && requiredMessage) || (!validator.isEmail(v) && "Ce champs est au mauvais format")}
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                />
                <ErrorMessage errors={errors} touched={touched} name="email" />
              </Col>
            </FormRow>
            <FormRow align="center">
              <Col md={4}>
                <Label>Choisissez un mot de passe</Label>
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "5px" }}>
                  👉 Il doit contenir au moins 8 caractères, dont une majuscule, une minuscule, un chiffre et un symbole
                </div>
              </Col>
              <Col>
                <ContainerPassword>
                  <Field
                    placeholder="Tapez votre mot de passe"
                    className="form-control"
                    validate={(v) => getPasswordErrorMessage(v, matomo)}
                    type={passwordText ? "text" : "password"}
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                  />
                  <EyeIcon src={passwordText ? EyeClose : EyeOpen} onClick={() => setPasswordText(!passwordText)} />
                </ContainerPassword>
                <ErrorMessage errors={errors} touched={touched} name="password" />
              </Col>
            </FormRow>
            <Footer>
              <ButtonContainer>
                <ContinueButton onClick={handleSubmit}>Continuer</ContinueButton>
              </ButtonContainer>
              {Object.keys(errors).length ? <h3>Vous ne pouvez passer à l'étape suivante car tous les champs ne sont pas correctement renseignés.</h3> : null}
            </Footer>
          </>
        )}
      </Formik>
    </Wrapper>
  );
};

const ContainerPassword = styled.div`
  position: relative;
  input {
    padding-right: 40px !important;
  }
`;

const EyeIcon = styled.img`
  position: absolute;
  right: 15px;
  top: 50%;
  height: 18px;
  opacity: 0.7;
  transform: translateY(-50%);
  font-size: 18px;
  cursor: pointer;
`;

const Wrapper = styled.div`
  padding: 40px;
  @media (max-width: 768px) {
    padding: 22px;
  }
`;
const Heading = styled.div`
  margin-bottom: 30px;
  h2 {
    color: #161e2e;
    font-size: 1.8rem;
    font-weight: 700;
  }
  p {
    color: #161e2e;
    font-size: 1rem;
  }
  @media (max-width: 768px) {
    h2 {
      font-size: 1.4rem;
    }
  }
`;

const FormRow = styled(Row)`
  border-bottom: 1px solid #e5e7eb;
  padding-top: 20px;
  padding-bottom: 20px;
  align-items: ${({ align }) => align};
  text-align: left;
  input[type="text"] {
    max-width: 500px;
  }
  input[name="password"] {
    max-width: 100%;
  }
  @media (max-width: 768px) {
    margin: 0 -22px;
  }
`;

const Label = styled.div`
  color: #374151;
  margin-bottom: 10px;
`;

const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  color: #374151;
  font-size: 14px;
  margin-bottom: 15px;
  :last-child {
    margin-bottom: 0;
  }
  input {
    cursor: pointer;
    margin-right: 12px;
    width: 15px;
    height: 15px;
    min-width: 15px;
    min-height: 15px;
  }
`;

const Footer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  h3 {
    border: 1px solid #fc8181;
    border-radius: 0.25em;
    margin-top: 1em;
    background-color: #fff5f5;
    color: #c53030;
    font-weight: 400;
    font-size: 12px;
    padding: 1em;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContinueButton = styled.button`
  color: #fff;
  background-color: #5145cd;
  padding: 9px 20px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 20px;
  margin-right: 10px;
  margin-top: 40px;
  display: block;
  width: 140px;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    opacity: 0.9;
  }
`;
