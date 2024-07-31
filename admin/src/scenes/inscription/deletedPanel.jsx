import Img3 from "../../assets/close_icon.png";
import Img2 from "../../assets/pencil.svg";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { YOUNG_SITUATIONS, translate as t, isInRuralArea, getAge, formatDateFRTimezoneUTC, formatStringLongDate } from "snu-lib";
import api from "../../services/api";
import PanelActionButton from "../../components/buttons/PanelActionButton";
import { Info, Details } from "../../components/Panel";
import plausibleEvent from "../../services/plausible";
import styled from "styled-components";
import PanelV2 from "../../components/PanelV2";

export default function DeletedInscriptionPanel({ onChange, value }) {
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
    <PanelV2 open={value && young ? true : false} onClose={onChange} title={"Compte supprimé"}>
      <Panel>
        <div className="info">
          <div>{t(young.gender)}</div>
          {young.birthdateAt && (
            <div>
              Né(e) le {formatDateFRTimezoneUTC(young.birthdateAt)} • {getAge(young.birthdateAt)} ans
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <Link to={`/volontaire/${young._id}`} onClick={() => plausibleEvent("Volontaires/CTA - Consulter profil volontaire")}>
              <PanelActionButton icon="eye" title="Consulter" />
            </Link>
          </div>
          <Details title="Vu(e) le" value={formatStringLongDate(young.lastActivityAt ?? young.lastLoginAt)} />
        </div>
        <Info title="Coordonnées" id={young._id}>
          <Details title="Ville" value={young.city && young.zip && `${young.city} (${young.zip})`} />
          <Details title="Dép" value={young.department} />
          <Details title="Région" value={young.region} />
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
        </Info>
        <Info title="Situations particulières" id={young._id}>
          <Details title="Quartier Prioritaire de la Ville" value={t(young.qpv)} />
          <Details title="Zone Rurale" value={t(isInRuralArea(young))} />
          <Details title="Handicap" value={t(young.handicap)} />
          <Details title="PPS" value={t(young.ppsBeneficiary)} />
          <Details title="PAI" value={t(young.paiBeneficiary)} />
          <Details title="Activités de haut niveau" value={t(young.highSkilledActivity)} />
        </Info>
      </Panel>
    </PanelV2>
  );
}

const Panel = styled.div`
  .close {
    color: #000;
    font-weight: 400;
    width: 45px;
    height: 45px;
    background: url(${Img3}) center no-repeat;
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
  hr {
    margin: 20px 0 30px;
  }
  .info {
    padding: 2rem 0;
    border-bottom: 1px solid #f2f1f1;
    &-title {
      font-weight: 500;
      font-size: 18px;
      padding-right: 35px;
    }
    &-edit {
      width: 30px;
      height: 26px;
      background: url(${Img2}) center no-repeat;
      background-size: 16px;
      position: absolute;
      right: 0;
      top: 0;
      cursor: pointer;
    }
  }
  .detail {
    border-bottom: 0.5px solid rgba(244, 245, 247, 0.5);
    padding: 5px 0;
    display: flex;
    font-size: 14px;
    text-align: left;
    align-items: flex-start;
    justify-content: space-between;
    margin-top: 10px;
    &-title {
      font-weight: bold;
      min-width: 100px;
      margin-right: 0.5rem;
    }
    &-text {
      text-align: left;
      color: rgba(26, 32, 44);
      a {
        color: #5245cc;
        :hover {
          text-decoration: underline;
        }
      }
    }
    .description {
      font-weight: 400;
      color: #aaa;
      font-size: 0.8rem;
    }
    .quote {
      font-size: 0.9rem;
      font-weight: 400;
      font-style: italic;
    }
  }
  .icon {
    cursor: pointer;
    margin: 0 0.5rem;
  }
  .application-detail {
    display: flex;
    flex-direction: column;
    padding: 5px 20px;
    margin-bottom: 0.5rem;
    text-align: left;
    :hover {
      box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 12px 0px;
      background: #f9f9f9;
    }
    &-priority {
      font-size: 0.75rem;
      color: #5245cc;
      margin-right: 0.5rem;
    }
    &-text {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      display: block;
      text-overflow: ellipsis;
    }
  }
  .quote {
    font-size: 0.9rem;
    font-weight: 400;
    font-style: italic;
  }
`;
