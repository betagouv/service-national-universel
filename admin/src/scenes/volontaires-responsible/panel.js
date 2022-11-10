import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { YOUNG_SITUATIONS, translate as t, getAge, formatDateFRTimezoneUTC } from "../../utils";
import LoadingButton from "../../components/buttons/LoadingButton";
import api from "../../services/api";
import SelectStatusApplication from "../../components/selectStatusApplication";
import PanelActionButton from "../../components/buttons/PanelActionButton";
import Panel from "../../components/Panel";

export default function PanelView({ onChange, value, application }) {
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
      <div className="close" onClick={onChange} />
      <div className="info">
        <div className="title">{`${young.firstName} ${young.lastName}`}</div>
        <div>{t(young.gender)}</div>
        {young.birthdateAt && (
          <div>
            Né(e) le {formatDateFRTimezoneUTC(young.birthdateAt)} • {getAge(young.birthdateAt)} ans
          </div>
        )}
        <div style={{ display: "flex" }}>
          <Link to={`/volontaire/${young._id}`}>
            <PanelActionButton icon="eye" title="Consulter" />
          </Link>
          {application.status === "VALIDATED" || application.status === "IN_PROGRESS" || application.status === "DONE" || application.status === "ABANDON" ? (
            <Link to={`/volontaire/${application.youngId}/phase2/application/${application._id}/contrat`}>
              <PanelActionButton icon="eye" title="Voir contrat" />
            </Link>
          ) : null}
        </div>
      </div>
      <Info title="Mission">
        <ApplicationDetails application={application} />
        <SelectStatusApplication hit={application} />
      </Info>

      <Info title="Coordonnées">
        <Details title="E-mail" value={young.email} />
        <Details title="Dép" value={young.department} />
        <Details title="Ville" value={young.city && young.zip && `${young.city} (${young.zip})`} />
        <Details title="Adresse" value={young.address} />
      </Info>
      <Info title="Situation">
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
        <Details title="Type" value={young.schoolType} />
        <Details title="Nom" value={young.schoolName} />
        <Details title="Région" value={young.schoolRegion} />
        <Details title="Dép" value={young.schoolDepartment} />
        <Details title="Ville" value={young.schoolCity && young.schoolZip && `${young.schoolCity} (${young.schoolZip})`} />
        <Details title="Adresse" value={young.schoolAddress} />
      </Info>
      {young.motivations && (
        <div className="info">
          <div className="info-title">Motivations</div>
          <div className="quote">{`« ${young.motivations} »`}</div>
        </div>
      )}
    </Panel>
  );
}

const Info = ({ children, title }) => {
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

const ApplicationDetails = ({ application }) => {
  if (!application) return <div />;
  return (
    <Link to={`/mission/${application.missionId}`}>
      <div className="application-detail">
        <div className="application-detail-priority">{`CHOIX ${application.priority}`}</div>
        <div className="application-detail-text">{application.missionName}</div>
      </div>
    </Link>
  );
};
