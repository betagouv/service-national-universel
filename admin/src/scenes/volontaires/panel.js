import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { YOUNG_SITUATIONS, YOUNG_PHASE, translate as t, YOUNG_STATUS, isInRuralArea, getAge, formatDateFR } from "../../utils";
import { appURL } from "../../config";
import api from "../../services/api";
import PanelActionButton from "../../components/buttons/PanelActionButton";
import Panel from "../../components/Panel";
import Historic from "../../components/historic";

export default ({ onChange, value }) => {
  const [young, setYoung] = useState(null);

  useEffect(() => {
    (async () => {
      const id = value && value._id;
      if (!id) return setYoung(null);
      const { data } = await api.get(`/referent/young/${id}`);
      setYoung(data);
    })();
  }, [value]);

  if (!value || !young) return <div />;

  return (
    <Panel>
      <div className="info">
        <div style={{ display: "flex" }}>
          <div className="close" onClick={onChange} />
          <div className="title">{`${young.firstName} ${young.lastName}`}</div>
        </div>
        <div>{t(young.gender)}</div>
        {young.birthdateAt && (
          <div>
            Né(e) le {formatDateFR(young.birthdateAt)} • {getAge(young.birthdateAt)} ans
          </div>
        )}
        <div style={{ display: "flex" }}>
          <Link to={`/volontaire/${young._id}`}>
            <PanelActionButton icon="eye" title="Consulter" />
          </Link>
          <Link to={`/volontaire/${young._id}/edit`}>
            <PanelActionButton icon="pencil" title="Modifier" />
          </Link>
        </div>
        <a href={`${appURL}/auth/connect?token=${api.getToken()}&young_id=${young._id}`}>
          <PanelActionButton icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" />
        </a>
      </div>
      {young.status === YOUNG_STATUS.WITHDRAWN ? (
        <Info title="Motif du désistement">
          <div className="quote">{young.withdrawnMessage ? `« ${young.withdrawnMessage} »` : "Non renseigné"}</div>
        </Info>
      ) : null}
      {young && young.historic && young.historic.length !== 0 && <Historic value={young.historic} />}
      {young.phase === YOUNG_PHASE.INTEREST_MISSION ? (
        <Info title="Recherche de MIG" id={young._id}>
          {young.applications.length ? (
            <>
              {young.applications.length &&
                young.applications
                  .sort((a, b) => (parseInt(a.priority) > parseInt(b.priority) ? 1 : parseInt(b.priority) > parseInt(a.priority) ? -1 : 0))
                  .slice(0, 3)
                  .map((a, i) => <ApplicationDetails key={i} application={a} i={i + 1} />)}
              <Link to={`/volontaire/${young._id}/phase2`}>
                <div style={{ textAlign: "center", color: "#5245cc" }}>{"Toutes ses candidatures >"}</div>
              </Link>
            </>
          ) : (
            <NoResult>Aucune candidature n'est liée à ce volontaire.</NoResult>
          )}
        </Info>
      ) : null}
      <Info title="Coordonnées" id={young._id}>
        <Details title="E-mail" value={young.email} />
        <Details title="Tel" value={young.phone} />
        <Details title="Région" value={young.region} />
        <Details title="Dép" value={young.department} />
        <Details title="Ville" value={young.city && young.zip && `${young.city} (${young.zip})`} />
        <Details title="Adresse" value={young.address} />
      </Info>
      <Info title="Situation" id={young._id}>
        <Details
          title="Statut"
          value={() => {
            if (young.situation === YOUNG_SITUATIONS.GENERAL_SCHOOL) return "En enseignement général ou technologique";
            if (young.situation === YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL) return "En enseignement professionnel";
            if (young.situation === YOUNG_SITUATIONS.AGRICULTURAL_SCHOOL) return "En lycée agricole";
            if (young.situation === YOUNG_SITUATIONS.SPECIALIZED_SCHOOL) return "En établissement spécialisé";
            if (young.situation === YOUNG_SITUATIONS.APPRENTICESHIP) return "En apprentissage";
            if (young.situation === YOUNG_SITUATIONS.EMPLOYEE) return "Salarié(e)";
            if (young.situation === YOUNG_SITUATIONS.INDEPENDANT) return "Indépendant(e)";
            if (young.situation === YOUNG_SITUATIONS.SELF_EMPLOYED) return "Auto-entrepreneur";
            if (young.situation === YOUNG_SITUATIONS.ADAPTED_COMPANY) return "En ESAT, CAT ou en entreprise adaptée";
            if (young.situation === YOUNG_SITUATIONS.POLE_EMPLOI) return "Inscrit(e) à Pôle emploi";
            if (young.situation === YOUNG_SITUATIONS.MISSION_LOCALE) return "Inscrit(e) à la Mission locale";
            if (young.situation === YOUNG_SITUATIONS.CAP_EMPLOI) return "Inscrit(e) à Cap emploi";
            if (young.situation === YOUNG_SITUATIONS.NOTHING) return "Inscrit(e) nulle part";
          }}
        />
        <Details title="Classe" value={young.grade} />
        <Details title="Type" value={young.schoolType} />
        <Details title="Nom" value={young.schoolName} />
        <Details title="Région" value={young.schoolRegion} />
        <Details title="Dép" value={young.schoolDepartment} />
        <Details title="Ville" value={young.schoolCity && young.schoolZip && `${young.schoolCity} (${young.schoolZip})`} />
        <Details title="Adresse" value={young.schoolAdress} />
      </Info>
      <Info title="Situations particulières" id={young._id}>
        <Details title="Quartier Prioritaire de la Ville" value={t(young.qpv)} />
        <Details title="Zone Rurale" value={t(isInRuralArea(young))} />
        <Details title="Handicap" value={t(young.handicap)} />
        <Details title="PPS" value={t(young.ppsBeneficiary)} />
        <Details title="PAI" value={t(young.paiBeneficiary)} />
        <Details title="Suivi médicosociale" value={t(young.medicosocialStructure)} />
        <Details title="Aménagement spécifique" value={t(young.specificAmenagment)} />
        <Details title="Activités de haut niveau" value={t(young.highSkilledActivity)} />
      </Info>
      {young.motivations && (
        <div className="info">
          <div className="info-title">Motivations</div>
          <div className="quote">{`« ${young.motivations} »`}</div>
        </div>
      )}
    </Panel>
  );
};

const Info = ({ children, title, id }) => {
  return (
    <div className="info">
      <div style={{ position: "relative" }}>
        <div className="info-title">{title}</div>
      </div>
      {children}
    </div>
  );
};

const Details = ({ title, value }) => {
  if (!value) return <div />;
  if (typeof value === "function") value = value();
  return (
    <div className="detail">
      <div className="detail-title">{`${title} :`}</div>
      <div className="detail-text">{value}</div>
    </div>
  );
};

const ApplicationDetails = ({ application, i }) => {
  if (!application) return <div />;
  return (
    <Link to={`/mission/${application.missionId}`}>
      <div className="application-detail">
        <div className="application-detail-priority">{`CHOIX ${i}`}</div>
        <div className="application-detail-text">{application.missionName}</div>
      </div>
    </Link>
  );
};

const NoResult = styled.div`
  text-align: center;
  font-style: italic;
  margin: 1rem;
`;
