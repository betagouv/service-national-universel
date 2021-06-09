import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { YOUNG_SITUATIONS, translate as t } from "../../utils";
import LoadingButton from "../../components/buttons/LoadingButton";
import api from "../../services/api";
import SelectStatusApplication from "../../components/selectStatusApplication";
import { getAge } from "snu-lib/date";

export default ({ onChange, value, application }) => {
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

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString();
  };

  return (
    <Panel>
      <div className="close" onClick={onChange} />
      <div className="info">
        <div className="title">{`${young.firstName} ${young.lastName}`}</div>
        <div>{t(young.gender)}</div>
        {young.birthdateAt && (
          <div>
            Né(e) le {formatDate(young.birthdateAt)} • {getAge(young.birthdateAt)} ans
          </div>
        )}
        <div style={{ display: "flex" }}>
          <Link to={`/volontaire/${young._id}`}>
            <Button icon={require("../../assets/eye.svg")} color="white">
              Consulter
            </Button>
          </Link>
          {/* <a href={`${appURL}/auth/connect?token=${api.getToken()}&young_id=${young._id}`}>
            <Button icon={require("../../assets/impersonate.svg")} color="white">
              Prendre&nbsp;sa&nbsp;place
            </Button>
          </a> */}
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
        <Details title="Adresse" value={young.schoolAdress} />
      </Info>
      <Info title="Situations particulières">
        <Details title="Quartier Prioritaire de la Ville" value={t(young.qpv)} />
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

const Button = styled(LoadingButton)`
  color: #555;
  background: ${({ icon }) => `url(${icon}) left 15px center no-repeat`};
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.16);
  border: 0;
  outline: 0;
  border-radius: 5px;
  padding: 0.2rem 1rem;
  padding-left: 2.5rem;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-right: 5px;
  margin-top: 1rem;
`;

const Panel = styled.div`
  background: #ffffff;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  flex: 1;
  max-width: 420px;
  position: relative;
  min-height: 100vh;
  font-size: 14px;
  align-self: flex-start;
  position: sticky;
  top: 68px;
  right: 0;
  /* overflow-y: auto; */
  .close {
    color: #000;
    font-weight: 400;
    width: 45px;
    height: 45px;
    background: url(${require("../../assets/close_icon.png")}) center no-repeat;
    background-size: 12px;
    padding: 15px;
    position: absolute;
    right: 15px;
    top: 15px;
    cursor: pointer;
  }
  .title {
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 2px;
  }
  .info {
    padding: 30px 25px;
    border-bottom: 1px solid #f2f1f1;
    &-title {
      font-weight: 500;
      font-size: 18px;
      margin-bottom: 15px;
      padding-right: 35px;
    }
    &-edit {
      width: 30px;
      height: 26px;
      background: url(${require("../../assets/pencil.svg")}) center no-repeat;
      background-size: 16px;
      position: absolute;
      right: 0;
      top: 0;
      cursor: pointer;
    }
  }
  .detail {
    display: flex;
    align-items: flex-end;
    padding: 5px 20px;
    font-size: 14px;
    text-align: left;
    &-title {
      min-width: 100px;
      width: 100px;
      margin-right: 5px;
    }
  }
  .application-detail {
    display: flex;
    flex-direction: column;
    padding: 5px 20px;
    margin-bottom: 1rem;
    text-align: left;
    :hover {
      background: #f9f9f9;
    }
    &-priority {
      font-size: 0.75rem;
      color: #5245cc;
    }
    &-text {
      margin-top: 0.5rem;
      color: inherit;
    }
  }

  .quote {
    font-size: 18px;
    font-weight: 400;
    font-style: italic;
  }
`;
