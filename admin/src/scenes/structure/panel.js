import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SocialIcons from "../../components/SocialIcons";

import api from "../../services/api";

export default ({ onChange, value }) => {
  const [missionsInfo, setMissionsInfo] = useState({ count: "-", placesTotal: "-" });
  useEffect(() => {
    if (!value) return;
    (async () => {
      const queries = [];
      queries.push({ index: "mission", type: "_doc" });
      queries.push({
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": value._id } }] } },
      });

      const { responses } = await api.esQuery(queries);
      setMissionsInfo({
        count: responses[0].hits.hits.length,
        placesTotal: responses[0].hits.hits.reduce((acc, e) => acc + e._source.placesTotal, 0),
        placesLeft: responses[0].hits.hits.reduce((acc, e) => acc + e._source.placesLeft, 0),
      });
    })();
  }, [value]);

  if (!value) return <div />;
  return (
    <Panel>
      <div className="close" onClick={onChange} />
      <div className="info">
        <div className="title">{value.name}</div>
      </div>
      <Info title="La structure">
        <div className="">{value.description}</div>
        <Details title="Agréments" value={value.associationTypes || "--"} />
        <Details title="Statut" value={value.statutJuridique || "--"} />
        <Details title="Région" value={value.region || "--"} />
        <Details title="Dép." value={value.department || "--"} />
        <Details title="Ville" value={value.city || "--"} />
        <Details title="Adresse" value={value.address || "--"} />
        <Details title="Siret" value={value.siret || "--"} />
        <Details title="Vitrine" value={<SocialIcons value={value} />} />
      </Info>
      <Info title={`Missions (${missionsInfo.count})`}>
        <p style={{ color: "#999" }}>Cette structure a {missionsInfo.count} missions disponibles</p>
        <table>
          <tr>
            <td style={{ fontSize: "2.5rem", paddingRight: "10px" }}>{missionsInfo.placesLeft}</td>
            <td>
              <b>Places restantes</b>
              <br />
              <span style={{ color: "#999" }}>
                {" "}
                {missionsInfo.placesTotal - missionsInfo.placesLeft} / {missionsInfo.placesTotal}
              </span>
            </td>
          </tr>
        </table>
      </Info>
      <div>
        {Object.keys(value).map((e, k) => {
          return <div key={k}>{`${e}:${value[e]}`}</div>;
        })}
      </div>
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
  return (
    <div className="detail">
      <div className="detail-title">{`${title} :`}</div>
      <div className="detail-text">{value}</div>
    </div>
  );
};

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
      padding-right: 35px;
    }
  }
  .detail {
    display: flex;
    font-size: 14px;
    text-align: left;
    margin-top: 10px;
    &-title {
      font-weight: bold;
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
  .social-link {
    border: solid 1px #aaa;
    padding: 5px 7px 7px 7px;
    margin: 5px;
    border-radius: 5px;
  }
`;
