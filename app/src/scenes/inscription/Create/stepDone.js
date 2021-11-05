import React, { useState } from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Field, Formik } from "formik";
import { toastr } from "react-redux-toastr";
import { Spinner } from "reactstrap";

import { HERO_IMAGES_LIST, SENDINBLUE_TEMPLATES, YOUNG_STATUS } from "../../../utils";
import api from "../../../services/api";
import ErrorMessage, { requiredMessage } from "../components/errorMessage";
import { translate } from "../../../utils";
import { setYoung } from "../../../redux/auth/actions";
import { appURL } from "../../../config";

export default () => {
  const history = useHistory();
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  if (!young) {
    history.push("/inscription/profil");
    return <div />;
  }
  return (
    <Container>
      <Info>
        <h3>INSCRIPTION AU SNU</h3>
        <h1>Vous y êtes presque !</h1>
        <p>Vous êtes sur le point de soumettre votre dossier à l'administration du SNU.</p>

        <Formik
          initialValues={young}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={async (values) => {
            setLoading(true);
            try {
              values.informationAccuracy = "true";
              const { ok, code, data } = await api.put("/young", { ...values, status: YOUNG_STATUS.WAITING_VALIDATION });
              if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
              toastr.success("Enregistré");
              dispatch(setYoung(data));
              await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_WAITING_VALIDATION}`, { cta: `${appURL}/auth` });
              history.push("/");
            } catch (e) {
              console.log(e);
              toastr.error("Oups, une erreur est survenue pendant le traitement du formulaire :", translate(e.code));
            } finally {
              setLoading(false);
            }
          }}
        >
          {({ values, handleChange, handleSubmit, errors, touched }) => (
            <>
              <RadioLabel>
                <Field
                  validate={(v) => !v && requiredMessage}
                  value={"true"}
                  checked={values.informationAccuracy}
                  type="checkbox"
                  name="informationAccuracy"
                  onChange={handleChange}
                />
                <div>
                  Je, <b>{`${young.firstName} ${young.lastName}`}</b>, certifie l'exactitude des renseignements fournis
                </div>
              </RadioLabel>

              <ErrorMessage errors={errors} touched={touched} name="informationAccuracy" />

              <ContinueButton onClick={handleSubmit}>
                {loading ? <Spinner size="sm" style={{ borderWidth: "0.1em" }} /> : "Je valide mon dossier d'inscription au SNU"}
              </ContinueButton>
            </>
          )}
        </Formik>
      </Info>
      <div className="thumb" />
    </Container>
  );
};

const Info = styled.div`
  flex: 1.5;
  padding: 5rem;
  @media (max-width: 768px) {
    padding: 1.5rem;
  }

  h1 {
    color: #111827;
    font-size: 2rem;
    margin-block: 0.5rem 2rem;
  }

  h3 {
    text-transform: uppercase;
    color: #4f46e5;
    letter-spacing: 0.05em;
    font-size: 16px;
  }

  p {
    font-size: 1.1rem;
    color: #909090;
    margin: 0;
  }

  .btns {
    display: flex;
    justify-content: center;
    align-items: center;
    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  .back {
    display: flex;
    align-items: center;
    color: #6b7280;
    margin-bottom: 2rem;
    cursor: pointer;
    width: fit-content;
  }
`;

const ContinueButton = styled.button`
  min-width: 110px;
  color: #fff;
  background-color: #5145cd;
  padding: 9px 20px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  margin-top: 40px;
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    opacity: 0.9;
  }
`;

const Container = styled.div`
  display: flex;

  @media (min-width: 768px) {
    .thumb {
      min-height: 400px;
      ${({ thumbImage = HERO_IMAGES_LIST[Math.floor(Math.random() * HERO_IMAGES_LIST.length)] }) =>
        `background: url(${require(`../../../assets/${thumbImage}`)}) no-repeat center;`}
      background-size: cover;
      flex: 1;
      -webkit-clip-path: polygon(15% 0, 0 100%, 100% 100%, 100% 0);
      clip-path: polygon(15% 0, 0 100%, 100% 100%, 100% 0);
    }
  }
`;

const RadioLabel = styled.label`
  div {
    width: 100%;
  }
  display: flex;
  align-items: flex-start;
  color: #374151;
  font-size: 14px;
  margin-top: 2rem;
  margin-bottom: 0px;
  text-align: left;
  :last-child {
    margin-bottom: 0;
  }
  input {
    cursor: pointer;
    margin-right: 12px;
    margin-top: 3px;
    width: 15px;
    height: 15px;
    min-width: 15px;
    min-height: 15px;
  }
`;
