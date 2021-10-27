import React, { useEffect } from "react";
import styled from "styled-components";
import { Row, Col } from "reactstrap";
import { Field, Formik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { setYoung } from "../../../redux/auth/actions";
import api from "../../../services/api";
import ErrorMessage, { requiredMessage } from "../components/errorMessage";
import AddressInput from "../../../components/addressInput";
import DndFileInput from "../../../components/dndFileInput";
import FormLegend from "../../../components/form/FormLegend";
import FormRow from "../../../components/form/FormRow";
import { STEPS } from "../utils";
import { translate } from "../../../utils";
import FormFooter from "../../../components/form/FormFooter";
import FormRadioLabelTrueFalse from "../../../components/form/FormRadioLabelTrueFalse";

export default () => {
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
        <h2>Situations particulières</h2>
        <p style={{ color: "#6B7280" }}>
          Complétez les informations ci-dessous{" "}
          <a target="blank" href="https://apicivique.s3.eu-west-3.amazonaws.com/Note_relative_aux_situations_particulie%CC%80res.pdf">
            En savoir plus
          </a>
        </p>
      </Heading>
      <Formik
        initialValues={young}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          try {
            values.inscriptionStep = STEPS.REPRESENTANTS;
            const { ok, code, data: young } = await api.put("/young", values);
            if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
            dispatch(setYoung(young));
            history.push("/inscription/representants");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant le traitement du formulaire :", translate(e.code));
          }
        }}
      >
        {({ values, handleChange, handleSubmit, isSubmitting, submitForm, errors, touched }) => (
          <>
            <FormLegend>Handicap et pathologies chroniques</FormLegend>
            <FormRadioLabelTrueFalse title="Etes-vous en situation de handicap ?" name="handicap" values={values} handleChange={handleChange} errors={errors} touched={touched} />
            <FormRadioLabelTrueFalse
              title="Etes-vous bénéficiaire d’un projet personnalisé de scolarisation (PPS)"
              name="ppsBeneficiary"
              values={values}
              handleChange={handleChange}
              errors={errors}
              touched={touched}
            >
              <div>
                <a href="https://www.service-public.fr/particuliers/vosdroits/F33865" target="_blank">
                  En savoir plus
                </a>
              </div>
            </FormRadioLabelTrueFalse>
            <FormRadioLabelTrueFalse
              title="Etes-vous bénéficiaire d’un projet d'accueil individualisé (PAI) ?"
              name="paiBeneficiary"
              values={values}
              handleChange={handleChange}
              errors={errors}
              touched={touched}
            >
              <div>
                <a href="https://www.service-public.fr/particuliers/vosdroits/F21392" target="_blank">
                  En savoir plus
                </a>
              </div>
            </FormRadioLabelTrueFalse>
            {(values["ppsBeneficiary"] === "true" || values["paiBeneficiary"] === "true" || values["handicap"] === "true") && (
              <>
                <FormRadioLabelTrueFalse
                  title="Avez-vous besoin d'un aménagement spécifique ?"
                  name="specificAmenagment"
                  values={values}
                  handleChange={handleChange}
                  errors={errors}
                  touched={touched}
                />
                <FormRadioLabelTrueFalse
                  title="Souhaitez-vous être affecté(e) dans votre département de résidence ?"
                  name="handicapInSameDepartment"
                  values={values}
                  handleChange={handleChange}
                  errors={errors}
                  touched={touched}
                />
                <FormRadioLabelTrueFalse
                  title="Avez-vous besoin d’un aménagement pour mobilité réduite ?"
                  name="reducedMobilityAccess"
                  values={values}
                  handleChange={handleChange}
                  errors={errors}
                  touched={touched}
                />
              </>
            )}
            <FormLegend>Sportif de haut niveau inscrit sur liste ministerielle</FormLegend>
            <FormRadioLabelTrueFalse
              title="Etes-vous sportif de haut niveau inscrit sur liste ministérielle ?"
              name="highSkilledActivity"
              values={values}
              handleChange={handleChange}
              errors={errors}
              touched={touched}
            />
            {values["highSkilledActivity"] === "true" && (
              <>
                <FormRadioLabelTrueFalse
                  title="Souhaitez-vous être affecté(e) dans votre département de résidence ?"
                  name="highSkilledActivityInSameDepartment"
                  values={values}
                  handleChange={handleChange}
                  errors={errors}
                  touched={touched}
                />
              </>
            )}
            <FormFooter values={values} handleSubmit={handleSubmit} errors={errors} />
          </>
        )}
      </Formik>
    </Wrapper>
  );
};

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
    margin: 0;
  }
`;

const Label = styled.div`
  color: #374151;
  margin-bottom: 10px;
  font-size: 1em;
  font-weight: 500;
  a {
    color: #5145cd;
    margin-top: 5px;
    font-size: 0.875rem;
    font-weight: 400;
    text-decoration: underline;
  }
  span {
    color: #6b7280;
    margin-top: 5px;
    font-size: 0.875rem;
    font-weight: 400;
  }
`;
