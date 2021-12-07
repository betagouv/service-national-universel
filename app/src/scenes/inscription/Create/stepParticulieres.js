import React, { useState } from "react";
import styled from "styled-components";
import { Formik } from "formik";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { setYoung } from "../../../redux/auth/actions";
import api from "../../../services/api";
import FormLegend from "../../../components/form/FormLegend";
import { STEPS } from "../utils";
import { translate } from "../../../utils";
import FormFooter from "../../../components/form/FormFooter";
import FormRadioLabelTrueFalse from "../../../components/form/FormRadioLabelTrueFalse";

export default function StepSpecific() {
  const history = useHistory();
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);
  const [loading, setLoading] = useState(false);

  if (!young) {
    history.push("/inscription/profil");
    return <div />;
  }

  return (
    <Wrapper>
      <Heading>
        <h2>Situations particulières</h2>
        <p style={{ color: "#6B7280" }}>Complétez les informations ci-dessous.</p>
        <p style={{ color: "#6B7280" }}>
          Il est important de signaler dès l&apos;inscription toute situation nécessitant une vigilance particulière ou des aménagements spécifiques : situation de handicap,
          allergies, intolérance alimentaire, projet d&apos;accueil individualisé (PAI), sport de haut niveau, etc. <br />
          En fonction des situations signalées, un responsable en charge du séjour de cohésion ou de la mission d&apos;intérêt général prendra contact avec le volontaire et ses
          représentants légaux.
        </p>
      </Heading>
      <Formik
        initialValues={young}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          setLoading(true);
          try {
            values.inscriptionStep = STEPS.REPRESENTANTS;
            const { ok, code, data } = await api.put("/young", values);
            if (!ok || !data?._id) return toastr.error("Une erreur s'est produite :", translate(code));
            dispatch(setYoung(data));
            history.push("/inscription/representants");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant le traitement du formulaire :", translate(e.code));
          } finally {
            setLoading(false);
          }
        }}>
        {({ values, handleChange, handleSubmit, errors, touched }) => (
          <>
            <FormLegend style={{ paddingBottom: "0" }}>Handicap et pathologies chroniques</FormLegend>
            <div>
              <a target="blank" href="https://cni-bucket-prod.cellar-c2.services.clever-cloud.com/file/Note_relative_aux_situations_particulieres.pdf">
                En savoir plus
              </a>
            </div>
            <FormRadioLabelTrueFalse title="Etes-vous en situation de handicap ?" name="handicap" values={values} handleChange={handleChange} errors={errors} touched={touched} />
            <FormRadioLabelTrueFalse
              title="Etes-vous bénéficiaire d’un projet personnalisé de scolarisation (PPS)"
              name="ppsBeneficiary"
              values={values}
              handleChange={handleChange}
              errors={errors}
              touched={touched}>
              <div>
                <a href="https://www.service-public.fr/particuliers/vosdroits/F33865" target="_blank" rel="noreferrer">
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
              touched={touched}>
              <div>
                <a href="https://www.service-public.fr/particuliers/vosdroits/F21392" target="_blank" rel="noreferrer">
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
                  touched={touched}>
                  (accompagnement professionnel, participation de jour, activités adaptées...)
                </FormRadioLabelTrueFalse>
                <FormRadioLabelTrueFalse
                  title="Avez-vous besoin d’un aménagement pour mobilité réduite ?"
                  name="reducedMobilityAccess"
                  values={values}
                  handleChange={handleChange}
                  errors={errors}
                  touched={touched}
                />
                <FormRadioLabelTrueFalse
                  title="Avez-vous besoin d'être affecté(e) dans votre département de résidence ?"
                  name="handicapInSameDepartment"
                  values={values}
                  handleChange={handleChange}
                  errors={errors}
                  touched={touched}
                />
              </>
            )}
            <FormRadioLabelTrueFalse
              title="Etes-vous en situation d'allergies ou d'intolérances alimentaires nécessitant la mise en place de mesures adaptées ?"
              name="allergies"
              values={values}
              handleChange={handleChange}
              errors={errors}
              touched={touched}
            />
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
                  title="Avez-vous besoin d'être affecté(e) dans votre département de résidence ?"
                  name="highSkilledActivityInSameDepartment"
                  values={values}
                  handleChange={handleChange}
                  errors={errors}
                  touched={touched}
                />
              </>
            )}
            <FormFooter loading={loading} values={values} handleSubmit={handleSubmit} errors={errors} />
          </>
        )}
      </Formik>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 40px;
  a {
    color: #5145cd;
    margin-top: 5px;
    font-size: 0.875rem;
    font-weight: 400;
    text-decoration: underline;
  }
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
    margin: 0;
  }
`;
