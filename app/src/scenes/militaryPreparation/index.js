import React from "react";
import styled from "styled-components";
import { Row, Col, Input } from "reactstrap";
import { useDispatch, useSelector } from "react-redux";
import { Field, Formik } from "formik";

import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../redux/auth/actions";
import { translate, MISSION_DOMAINS, PERIOD, PROFESSIONNAL_PROJECT, PROFESSIONNAL_PROJECT_PRECISION } from "../../utils";
import { HeroContainer, Hero, Content, SeparatorXS } from "../../components/Content";
import UploadCard from "./components/UploadCard";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();

  return (
    <>
      <HeroContainer>
        <Hero>
          <Content>
            <h1>Réalisez votre mission lors d’une préparation militaire</h1>
            <p>Une période de découverte du milieu militaire pour vivre durant quelques jours le quotidien d’un soldat. </p>
          </Content>
          <div className="thumb" />
        </Hero>
      </HeroContainer>
      <HeroContainer>
        <Hero>
          <Content style={{ width: "100%" }}>
            <h2>Quelques mots au sujet de la préparation militaire</h2>
            <p>
              L'inscription à cette préparation est bien évidemment basée sur le volontariat. Cette période en immersion vous permettra d'avoir une excellente première approche,
              afin de tester votre motivation à faire carrière ou non dans l'armée.{" "}
            </p>
            <SeparatorXS />
            <h2>Contactez votre référent pour plus d’informations</h2>
            <a>Michel Cymes - mcymes@toulouse.fr</a>
          </Content>
        </Hero>
      </HeroContainer>
      <Formik
        initialValues={young}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          try {
            const { ok, code, data: young } = await api.put("/young", values);
            if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
            dispatch(setYoung(young));
            history.push("/");
          } catch (e) {
            console.log(e);
            toastr.error("Erreur !");
          }
        }}
      >
        {({ values, handleChange, handleSubmit, errors, touched }) => (
          <HeroContainer>
            <Row>
              <Col md={6} xs={12}>
                <UploadCard values={values} name="militaryPreparationFiles1" handleChange={handleChange} />
              </Col>
            </Row>
          </HeroContainer>
        )}
      </Formik>
    </>
  );
};

const Infos = styled.div`
  font-size: 0.8rem;
  color: #6a7181;
  font-weight: 400;
  @media (max-width: 768px) {
    font-size: 0.7rem;
  }
`;

const PreferenceItem = ({ title, children, subtitle }) => {
  return (
    <HeroContainer>
      <Hero>
        <PreferenceContent style={{ width: "100%" }}>
          <Title>
            <span>{title}</span>
            <Infos>{subtitle}</Infos>
          </Title>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>{children}</div>
        </PreferenceContent>
      </Hero>
    </HeroContainer>
  );
};

const Wrapper = styled.div`
  display: flex;
  text-align: center;
  @media (max-width: 767px) {
    display: block;
    > * {
      margin: 0.5rem auto;
    }
  }
`;

const Footer = styled.div`
  margin-bottom: 2rem;
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

const Title = styled.div`
  position: relative;
  text-align: center;
  font-size: 1.25rem;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  font-weight: 700;
  margin: 1rem 0;
  ::after {
    content: "";
    display: block;
    height: 1px;
    width: 100%;
    background-color: #d2d6dc;
    position: absolute;
    left: 0;
    top: 50%;
    @media (max-width: 768px) {
      top: 110%;
    }
    transform: translateY(-50%);
    z-index: -1;
  }
  span {
    padding: 0 10px;
    background-color: #fff;
    color: rgb(22, 30, 46);
  }
`;

const PreferenceContent = styled(Content)`
  padding: 2rem;
  padding-top: 0.5rem;
`;

const ContinueButton = styled.button`
  color: #fff;
  background-color: #5145cd;
  padding: 9px 20px;
  border: 0;
  outline: 0;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1rem;
  @media (max-width: 768px) {
    font-size: 0.8rem;
  }
  display: block;
  outline: 0;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  :hover {
    opacity: 0.9;
  }
`;
