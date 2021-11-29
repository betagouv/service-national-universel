import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import { Formik } from "formik";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";

import LoadingButton from "../../../components/buttons/LoadingButton";
import { translate, ROLES } from "../../../utils";
import api from "../../../services/api";
import PanelActionButton from "../../../components/buttons/PanelActionButton";
import { appURL, environment } from "../../../config";
import Loader from "../../../components/Loader";

import DeleteButton from "../components/DeleteButton";
import Identite from "./identite";
import Historic from "./historic";
import Coordonnees from "./coordonnees";
import Situation from "./situation";
import SituationsParticulieres from "./situations-particulieres";
import Motivation from "./motivation";
import Representant1 from "./representant-legal1";
import Representant2 from "./representant-legal2";
import Preferences from "./preferences";
import Consentement from "./consentement";
import ConsentementImage from "./consentement-image";
import ConsentementPCR from "./consentement-pcr";
import Rules from "./rules";
import InformationsSupplementaires from "./informations-supplementaires";
import MilitaryPreparation from "./military-preparation";
import JDC from "./JDC";
import CohesionCenter from "./cohesion-center";
import MeetingPoint from "./meeting-point";

export default (props) => {
  const [young, setYoung] = useState();
  const user = useSelector((state) => state.Auth.user);

  useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return setYoung(null);
      const { data } = await api.get(`/referent/young/${id}`);
      return setYoung(data);
    })();
  }, []);

  if (young === undefined) return <Loader />;

  const getSubtitle = () => {
    const createdAt = new Date(young.createdAt);

    dayjs.extend(relativeTime).locale("fr");
    const diff = dayjs(createdAt).fromNow();
    return `Inscrit(e) ${diff} - ${createdAt.toLocaleDateString()}`;
  };

  return (
    <Wrapper>
      <Formik
        initialValues={young}
        validateOnChange={false}
        validateOnBlur={false}
        onSubmit={async (values) => {
          try {
            const { ok, code, data: young } = await api.put(`/referent/young/${values._id}`, values);
            if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
            toastr.success("Mis à jour!");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
          }
        }}>
        {({ values, handleChange, handleSubmit, isSubmitting, submitForm, validateField, errors, touched, setFieldValue }) => (
          <>
            <TitleWrapper>
              <div>
                <Title>{`Profil de ${values.firstName} ${values.lastName}`}</Title>
                <SubTitle>{getSubtitle()}</SubTitle>
              </div>
              <div style={{ display: "flex" }}>
                <a href={`${appURL}/auth/connect?token=${api.getToken()}&young_id=${young._id}`}>
                  <PanelActionButton icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" />
                </a>
                <Link to={`/volontaire/${young._id}`}>
                  <PanelActionButton icon="eye" title="Consulter" />
                </Link>
                <LoadingButton loading={isSubmitting} onClick={handleSubmit}>
                  Enregistrer
                </LoadingButton>
              </div>
            </TitleWrapper>
            {Object.values(errors).filter((e) => !!e).length ? (
              <Alert>Vous ne pouvez pas enregistrer ce volontaires car tous les champs ne sont pas correctement renseignés.</Alert>
            ) : null}
            <Row>
              <Identite values={values} handleChange={handleChange} handleSubmit={handleSubmit} />
              <Historic young={young} />
              <Coordonnees values={values} handleChange={handleChange} validateField={validateField} errors={errors} touched={touched} />
              <Situation values={values} handleChange={handleChange} setFieldValue={setFieldValue} errors={errors} />
              <SituationsParticulieres values={values} handleChange={handleChange} handleSubmit={handleSubmit} />
              <Motivation values={values} />
            </Row>
            <Row>
              <Representant1 values={values} handleChange={handleChange} />
              <Representant2 values={values} handleChange={handleChange} />
            </Row>
            <Row>
              <Preferences values={values} handleChange={handleChange} />
            </Row>
            <Row>
              <InterTitle>Consentements</InterTitle>
            </Row>
            <Row>
              <Consentement values={values} handleChange={handleChange} handleSubmit={handleSubmit} />
              <ConsentementImage values={values} handleChange={handleChange} handleSubmit={handleSubmit} />
              <ConsentementPCR values={values} handleChange={handleChange} handleSubmit={handleSubmit} />
              <Rules values={values} handleChange={handleChange} handleSubmit={handleSubmit} />
            </Row>
            <Row>
              <InterTitle>Séjour de cohésion</InterTitle>
            </Row>
            <Row>
              <CohesionCenter values={values} handleChange={handleChange} handleSubmit={handleSubmit} />
              {values.statusPhase1 === "AFFECTED" ? <MeetingPoint values={values} handleChange={handleChange} handleSubmit={handleSubmit} /> : null}
            </Row>
            <Row>
              {values.cohort === "2020" ? <JDC values={values} handleChange={handleChange} /> : null}
              {user.role === ROLES.ADMIN ? <InformationsSupplementaires values={values} handleChange={handleChange} /> : null}
            </Row>
            <Row>
              <InterTitle>Préparation Militaire</InterTitle>
            </Row>
            <Row>
              <MilitaryPreparation values={values} handleChange={handleChange} handleSubmit={handleSubmit} />
            </Row>
            {Object.values(errors).filter((e) => !!e).length ? (
              <Alert>Vous ne pouvez pas enregistrer ce volontaires car tous les champs ne sont pas correctement renseignés.</Alert>
            ) : null}
            <TitleWrapper>
              <DeleteButton young={young} />
              <div style={{ display: "flex" }}>
                <a href={`${appURL}/auth/connect?token=${api.getToken()}&young_id=${young._id}`}>
                  <PanelActionButton icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" />
                </a>
                <Link to={`/volontaire/${young._id}`}>
                  <PanelActionButton icon="eye" title="Consulter" />
                </Link>
                <LoadingButton loading={isSubmitting} onClick={handleSubmit}>
                  Enregistrer
                </LoadingButton>
              </div>
            </TitleWrapper>
          </>
        )}
      </Formik>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 20px 40px;
`;

const TitleWrapper = styled.div`
  margin: 32px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InterTitle = styled.h2`
  color: #888;
  margin: 1rem;
  font-weight: 450;
  font-size: 0.9rem;
  text-transform: uppercase;
`;

const Alert = styled.h3`
  border: 1px solid #fc8181;
  border-radius: 0.25em;
  background-color: #fff5f5;
  color: #c53030;
  font-weight: 400;
  font-size: 12px;
  padding: 1em;
  text-align: center;
`;

const Title = styled.h2`
  color: #242526;
  font-weight: bold;
  font-size: 28px;
`;
const SubTitle = styled.h2`
  color: #242526;
  font-size: 1rem;
  font-weight: 300;
`;
