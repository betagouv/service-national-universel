import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Row } from "reactstrap";
import { Formik } from "formik";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/fr";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";
import plausibleEvent from "../../../services/pausible";
import useDocumentTitle from "../../../hooks/useDocumentTitle";

import LoadingButton from "../../../components/buttons/LoadingButton";
import { translate, ROLES } from "../../../utils";
import api from "../../../services/api";
import PanelActionButton from "../../../components/buttons/PanelActionButton";
import { appURL } from "../../../config";
import Loader from "../../../components/Loader";

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
import ModalConfirm from "../../../components/modals/ModalConfirm";

export default function VolontaireEdit(props) {
  const [young, setYoung] = useState();
  const user = useSelector((state) => state.Auth.user);
  const setDocumentTitle = useDocumentTitle("Volontaires");
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const history = useHistory();

  useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return setYoung(null);
      const { data } = await api.get(`/referent/young/${id}`);
      setDocumentTitle(`${data.firstName} ${data.lastName}`);
      setYoung(data);
    })();
  }, []);

  const onClickDelete = () => {
    setModal({
      isOpen: true,
      onConfirm: onConfirmDelete,
      title: "Êtes-vous sûr(e) de vouloir supprimer ce volontaire ?",
      message: "Cette action est irréversible.",
    });
  };

  const onConfirmDelete = async () => {
    try {
      const { ok, code } = await api.put(`/young/${young._id}/soft-delete`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Ce volontaire a été supprimé.");
      return history.push(`/volontaire`);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression du volontaire :", translate(e.code));
    }
  };

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
            const { ok, code } = await api.put(`/referent/young/${values._id}`, values);
            if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
            toastr.success("Mis à jour!");
          } catch (e) {
            console.log(e);
            toastr.error("Oups, une erreur est survenue pendant la mise à jour des informations :", translate(e.code));
          }
        }}>
        {({ values, handleChange, handleSubmit, isSubmitting, validateField, errors, touched, setFieldValue }) => (
          <>
            <TitleWrapper>
              <div>
                <Title>{`Profil de ${values.firstName} ${values.lastName}`}</Title>
                <SubTitle>{getSubtitle()}</SubTitle>
              </div>
              <div style={{ display: "flex" }}>
                <PanelActionButton onClick={onClickDelete} icon="bin" title="Supprimer" />
                <a href={`${appURL}/auth/connect?token=${api.getToken()}&young_id=${young._id}`}>
                  <PanelActionButton icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" />
                </a>
                <Link to={`/volontaire/${young._id}`} onClick={() => plausibleEvent("Volontaires/CTA - Consulter profil volontaire")}>
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
              <Situation values={values} handleChange={handleChange} setFieldValue={setFieldValue} errors={errors} touched={touched} />
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
            {values.statusPhase1 === "AFFECTED" ? (
              <Row>
                <CohesionCenter values={values} handleChange={handleChange} handleSubmit={handleSubmit} />
                <MeetingPoint values={values} handleChange={handleChange} handleSubmit={handleSubmit} />
              </Row>
            ) : null}
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
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <PanelActionButton onClick={onClickDelete} icon="bin" title="Supprimer" />
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
          </>
        )}
      </Formik>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={async () => {
          await modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </Wrapper>
  );
}

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
