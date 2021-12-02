import React from "react";
import styled from "styled-components";
import { Formik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { setYoung } from "../../redux/auth/actions";
import api from "../../services/api";
import { STEPS_2020 } from "../inscription/utils";
import { translate } from "../../utils";
import FormFooter from "../../components/form/FormFooter";
import FormRadioLabelTrueFalse from "../../components/form/FormRadioLabelTrueFalse";

export default function JdcComponent() {
  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);

  if (!young) {
    history.push("/inscription/profil");
    return <div />;
  }

  return (
    <Wrapper>
      <Heading>
        <h2>Journée de Défense et Citoyenneté</h2>
        <p>Informez ci-dessous l&apos;administration de votre situation</p>
      </Heading>
      <Formik
        initialValues={young}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          try {
            values.cohesion2020Step = STEPS_2020.DONE;
            values.statusPhase1 = "WAITING_AFFECTATION";
            const { ok, code, data: young } = await api.put("/young", values);
            if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
            dispatch(setYoung(young));
            history.push("/cohesion/done");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant le traitement du formulaire :", translate(e.code));
          }
        }}>
        {({ values, handleChange, handleSubmit, errors, touched }) => (
          <>
            <FormRadioLabelTrueFalse
              title="Avez-vous réalisé votre Journée de Défense et Citoyenneté ?"
              name="jdc"
              values={values}
              handleChange={handleChange}
              errors={errors}
              touched={touched}
            />
            <FormFooter values={values} handleSubmit={handleSubmit} errors={errors} />
          </>
        )}
      </Formik>
    </Wrapper>
  );
}

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
  a {
    color: #5145cd;
    margin-top: 5px;
    font-size: 0.875rem;
    font-weight: 400;
    text-decoration: underline;
  }
  p {
    color: #161e2e;
  }
`;
