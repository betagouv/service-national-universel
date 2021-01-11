import React from "react";
import styled from "styled-components";
import { Row, Col, Input, Container, CustomInput } from "reactstrap";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Formik } from "formik";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../redux/auth/actions";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();

  return (
    <Wrapper>
      <Heading>
        <span>MES PRÉFÉRENCES</span>
        <h1>Indiquez vos préférences</h1>
        <p>
          Les missions proposées sont classées en 9 thématiques. Indiquez pour chacune votre intérêt. Des missions à proximité de votre domicile et correspondant à vos préférences
          vous seront ensuite proposées.
        </p>
      </Heading>
      <Formik
        initialValues={young}
        onSubmit={async (values) => {
          try {
            const { ok, code, data: young } = await api.put(`/young`, values);
            if (!ok) return toastr.error("Erreur", code);
            if (young) {
              dispatch(setYoung(young));
            }
            return toastr.success("Mis à jour!");
          } catch (e) {
            console.log(e);
            toastr.error("Erreur !");
          }
        }}
      >
        {({ values, handleChange, handleSubmit, isSubmitting, submitForm }) => (
          <>
            <Item
              name="citizenshipInterest"
              values={values}
              handleChange={handleChange}
              title="Citoyenneté / Vivre ensemble"
              subtitle="Lutte contre le racisme, contre les discriminations..."
            />
            <Item
              name="cultureInterest"
              values={values}
              handleChange={handleChange}
              title="Culture"
              subtitle="Aide à des associations culturelles, bénévole au sein d’un salle de musique, d’un musée..."
            />
            <Item
              name="defenseInterest"
              values={values}
              handleChange={handleChange}
              title="Défense et mémoire"
              subtitle="Préparations militaires, participation à des commémorations, entretien de lieux de mémoire..."
            />
            <Item
              name="educationInterest"
              values={values}
              handleChange={handleChange}
              title="Éducation et animation"
              subtitle="Animation dans des centres de loisir, aide aux devoirs"
            />
            <Item
              name="environmentInterest"
              values={values}
              handleChange={handleChange}
              title="Environnement"
              subtitle="Protection de la nature et des animaux, promotion du recyclage, du compostage"
            />
            <Item
              name="healthInterest"
              values={values}
              handleChange={handleChange}
              title="Santé"
              subtitle="A l’hôpital, aider les services pour améliorer le confort des patients et de leurs proches (apporter des boissons, des livres, aider à obtenir la TV, baisser des stores...)"
            />
            <Item
              name="securityInterest"
              values={values}
              handleChange={handleChange}
              title="Sécurité"
              subtitle="Participation aux action de la Gendarmerie - des pompiers ou d’associations de protection civile"
            />
            <Item
              name="solidarityInterest"
              values={values}
              handleChange={handleChange}
              title="Solidarité"
              subtitle="Participer aux collectes et distribution de colis alimentaires, aux maraudes ou participer aux actions d’animation dans les établissements pour les personnes âgées, en situation de handicap ou en difficulté"
            />
            <Item name="sportInterest" values={values} handleChange={handleChange} title="Sport" subtitle="Animation d’un club ou d’une association sportive..." />
            <ContinueButton onClick={handleSubmit}>Continuer</ContinueButton>
          </>
        )}
      </Formik>
    </Wrapper>
  );
};

const Item = ({ title, subtitle, name, values, handleChange }) => {
  return (
    <FormRow>
      <Col md={8}>
        <Label>{title}</Label>
        <Description>{subtitle}</Description>
      </Col>
      <Col md={4}>
        <CustomInput id={name} name={name} value={values[name]} onChange={handleChange} type="select">
          <option value={5} label="Très intéressé" />
          <option value={4} label="Intéressé" />
          <option value={3} label="Assez intéressé" />
          <option value={2} label="Peu intéressé" />
          <option value={1} label="Pas intéressé" />
        </CustomInput>
      </Col>
    </FormRow>
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
  h1 {
    color: #161e2e;
    font-size: 45px;
    font-weight: 700;
  }
  span {
    color: #42389d;
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 5px;
  }
  p {
    color: #6b7280;
    margin-bottom: 0;
    font-size: 15px;
    font-weight: 400;
  }
`;

const FormLegend = styled.div`
  color: #161e2e;
  font-size: 18px;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  padding: 20px 0;
  p {
    color: #6b7280;
    margin-bottom: 0;
    font-size: 15px;
    font-weight: 400;
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
`;

const Label = styled.div`
  color: #191f2c;
`;

const Description = styled.div`
  color: #6b7280;
  margin-bottom: 0;
  font-size: 15px;
  font-weight: 400;
`;

const ImageInput = styled.label`
  border: 1px dashed #d2d6dc;
  padding: 25px;
  text-align: center;
  display: block;
  outline: 0;
  border-radius: 6px;
  cursor: pointer;
  color: #4b5563;
  max-width: 500px;
  font-size: 14px;
  line-height: 1.7;
  cursor: pointer;

  img {
    height: 40px;
    display: block;
    margin: 10px auto;
  }
`;

const ContinueButton = styled.button`
  color: #fff;
  background-color: #5145cd;
  padding: 9px 20px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  font-weight: 400;
  font-size: 20px;
  margin: auto;
  display: block;
  width: 140px;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    opacity: 0.9;
  }
`;

const Modifybutton = styled(Link)`
  border: 1px solid #d2d6dc;
  padding: 10px 15px;
  color: #3d4151;
  font-size: 12px;
  border-radius: 4px;
  margin-top: 5px;
  display: inline-block;
  :hover {
    color: #333;
  }
`;
