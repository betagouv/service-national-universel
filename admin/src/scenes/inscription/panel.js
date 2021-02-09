import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { YOUNG_SITUATIONS, translate as t } from "../../utils";
import LoadingButton from "../../components/loadingButton";
import DownloadButton from "../../components/DownloadButton";
import Historic from "../../components/historic";
import api from "../../services/api";

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

  if (!value) return <div />;

  const formatDate = (d) => {
    const date = new Date(d);
    return date.toLocaleDateString();
  };

  const getAge = (d) => {
    const now = new Date();
    const date = new Date(d);
    const diffTime = Math.abs(date - now);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
  };

  return (
    <Panel>
      <div className="close" onClick={onChange} />
      <div className="info">
        <div className="title">{`${value.firstName} ${value.lastName}`}</div>
        <div>{t(value.gender)}</div>
        {value.birthdateAt && (
          <div>
            Né(e) le {formatDate(value.birthdateAt)} - {getAge(value.birthdateAt)} ans
          </div>
        )}
        <Link to={`/volontaire/${value._id}`}>
          <EditBtn color="white">Modifier</EditBtn>
        </Link>
      </div>
      {young && young.historic && young.historic.length !== 0 && <Historic value={young.historic} />}
      <Info title="Pièce d’identité" id={value._id}>
        {(value.cniFiles || []).map((e, i) => (
          <DownloadButton
            key={i}
            source={() => api.get(`/referent/youngFile/${value._id}/cniFiles/${e}`)}
            title={`Télécharger la pièce d’identité (${i + 1}/${value.cniFiles.length})`}
          />
        ))}
      </Info>
      <Info title="Consentements du ou des représentants légaux" id={value._id}>
        {(value.parentConsentmentFiles || []).map((e, i) => (
          <DownloadButton
            key={i}
            source={() => api.get(`/referent/youngFile/${value._id}/parentConsentmentFiles/${e}`)}
            title={`Télécharger le formulaire (${i + 1}/${value.parentConsentmentFiles.length})`}
          />
        ))}
      </Info>
      <Info title="Coordonnées" id={value._id}>
        <Details title="E-mail" value={value.email} />
        <Details title="Tel" value={value.phone} />
        <Details title="Région" value={value.region} />
        <Details title="Dép" value={value.department} />
        <Details title="Ville" value={value.city && value.zip && `${value.city} (${value.zip})`} />
        <Details title="Adresse" value={value.address} />
      </Info>
      <Info title="Situation" id={value._id}>
        <Details
          title="Statut"
          value={() => {
            if (value.situation === YOUNG_SITUATIONS.GENERAL_SCHOOL) return "En enseignement général ou technologique";
            if (value.situation === YOUNG_SITUATIONS.PROFESSIONAL_SCHOOL) return "En enseignement professionnel";
            if (value.situation === YOUNG_SITUATIONS.AGRICULTURAL_SCHOOL) return "En lycée agricole";
            if (value.situation === YOUNG_SITUATIONS.SPECIALIZED_SCHOOL) return "En établissement spécialisé";
            if (value.situation === YOUNG_SITUATIONS.APPRENTICESHIP) return "En apprentissage";
            if (value.situation === YOUNG_SITUATIONS.EMPLOYEE) return "Salarié(e)";
            if (value.situation === YOUNG_SITUATIONS.INDEPENDANT) return "Indépendant(e)";
            if (value.situation === YOUNG_SITUATIONS.SELF_EMPLOYED) return "Auto-entrepreneur";
            if (value.situation === YOUNG_SITUATIONS.ADAPTED_COMPANY) return "En ESAT, CAT ou en entreprise adaptée";
            if (value.situation === YOUNG_SITUATIONS.POLE_EMPLOI) return "Inscrit(e) à Pôle emploi";
            if (value.situation === YOUNG_SITUATIONS.MISSION_LOCALE) return "Inscrit(e) à la Mission locale";
            if (value.situation === YOUNG_SITUATIONS.CAP_EMPLOI) return "Inscrit(e) à Cap emploi";
            if (value.situation === YOUNG_SITUATIONS.NOTHING) return "Inscrit(e) nulle part";
          }}
        />
        <Details title="Type" value={value.schoolType} />
        <Details title="Nom" value={value.schoolName} />
        <Details title="Région" value={value.schoolRegion} />
        <Details title="Dép" value={value.schoolDepartment} />
        <Details title="Ville" value={value.schoolCity && value.schoolZip && `${value.schoolCity} (${value.schoolZip})`} />
        <Details title="Adresse" value={value.schoolAdress} />
      </Info>
      <Info title="Situations particulières" id={value._id}>
        <Details title="Handicap" value={t(value.handicap)} />
        <Details title="PPS" value={t(value.ppsBeneficiary)} />
        <Details title="PAI" value={t(value.paiBeneficiary)} />
        <Details title="Suivi médicosociale" value={t(value.medicosocialStructure)} />
        <Details title="Aménagement spécifique" value={t(value.medicosocialStructure)} />
        <Details title="Activités de haut niveau" value={t(value.highSkilledActivity)} />
      </Info>
      <Info title="Représentant légal n°1" id={value._id}>
        <Details title="Statut" value={t(value.parent1Status)} />
        <Details title="Prénom" value={value.parent1FirstName} />
        <Details title="Nom" value={value.parent1LastName} />
        <Details title="E-mail" value={value.parent1Email} />
        <Details title="Tel" value={value.parent1Phone} />
        <Details title="Région" value={value.parent1Region} />
        <Details title="Dép" value={value.parent1Department} />
        <Details title="Ville" value={value.parent1City && value.parent1Zip && `${value.parent1City} (${value.parent1Zip})`} />
        <Details title="Adresse" value={value.parent1Address} />
      </Info>
      {value.parent2Status && (
        <Info title="Représentant légal n°2" id={value._id}>
          <Details title="Statut" value={t(value.parent2Status)} />
          <Details title="Prénom" value={value.parent2FirstName} />
          <Details title="Nom" value={value.parent2LastName} />
          <Details title="E-mail" value={value.parent2Email} />
          <Details title="Tel" value={value.parent2Phone} />
          <Details title="Région" value={value.parent2Region} />
          <Details title="Dép" value={value.parent2Department} />
          <Details title="Ville" value={value.parent2City && value.parent2Zip && `${value.parent2City} (${value.parent2Zip})`} />
          <Details title="Adresse" value={value.parent2Address} />
        </Info>
      )}
      {value.motivations && (
        <div className="info">
          <div className="info-title">Motivations</div>
          <div className="quote">{`« ${value.motivations} »`}</div>
        </div>
      )}
      {/* <div>
        {Object.keys(value).map((e) => {
          return <div>{`${e}:${value[e]}`}</div>;
        })}
      </div> */}
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

const EditBtn = styled(LoadingButton)`
  color: #555;
  background: url(${require("../../assets/pencil.svg")}) left 15px center no-repeat;
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.16);
  border: 0;
  outline: 0;
  border-radius: 5px;
  padding: 8px 25px 8px 40px;
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
  .quote {
    font-size: 18px;
    font-weight: 400;
    font-style: italic;
  }
`;
