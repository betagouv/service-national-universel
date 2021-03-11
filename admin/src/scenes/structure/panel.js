import React, { useState, useEffect } from "react";
import styled from "styled-components";
import SocialIcons from "../../components/SocialIcons";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import { useHistory } from "react-router-dom";

import api from "../../services/api";
import { translate } from "../../utils";
import Team from "./components/Team";
import PanelActionButton from "../../components/buttons/PanelActionButton";

export default ({ onChange, value }) => {
  const [missionsInfo, setMissionsInfo] = useState({ count: "-", placesTotal: "-" });
  const [referents, setReferents] = useState([]);
  const [parentStructure, setParentStructure] = useState(null);
  const history = useHistory();
  useEffect(() => {
    if (!value) return;
    (async () => {
      const queries = [];
      queries.push({ index: "mission", type: "_doc" });
      queries.push({
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": value._id } }] } },
      });
      queries.push({ index: "referent", type: "_doc" });
      queries.push({
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": value._id } }] } },
      });
      if (value.networkId) {
        queries.push({ index: "structure", type: "_doc" });
        queries.push({
          query: { bool: { must: { match_all: {} }, filter: [{ term: { _id: value.networkId } }] } },
        });
      }

      const { responses } = await api.esQuery(queries);

      if (value.networkId) {
        const structures = responses[2]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
        setParentStructure(structures.length ? structures[0] : null);
      } else {
        setParentStructure(null);
      }
      setMissionsInfo({
        count: responses[0].hits.hits.length,
        placesTotal: responses[0].hits.hits.reduce((acc, e) => acc + e._source.placesTotal, 0),
        placesLeft: responses[0].hits.hits.reduce((acc, e) => acc + e._source.placesLeft, 0),
      });
      setReferents(responses[1]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })));
    })();
  }, [value]);

  const handleDelete = async (structure) => {
    if (!confirm("Êtes-vous sûr(e) de vouloir supprimer cette structure ?")) return;
    try {
      const { ok, code } = await api.remove(`/structure/${structure._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Cette structure a été supprimée.");
      return history.go(0);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression de la structure :", translate(e.code));
    }
  };

  if (!value) return <div />;
  return (
    <Panel>
      <div style={{ display: "flex" }}>
        <Subtitle>structure</Subtitle>
        <div className="close" onClick={onChange} />
      </div>
      <div className="info">
        <div className="title">{value.name}</div>
        <div style={{ display: "flex" }}>
          <Link to={`/structure/${value._id}`}>
            <PanelActionButton icon="eye" title="Consulter" />
          </Link>
          <Link to={`/structure/${value._id}/edit`}>
            <PanelActionButton icon="pencil" title="Modifier" />
          </Link>
          <PanelActionButton onClick={() => handleDelete(value)} icon="bin" title="Supprimer" />
        </div>
      </div>
      <Info title="La structure">
        <div>{value.description}</div>
        <Details title="Statut" value={translate(value.legalStatus) || "--"} />
        {value.legalStatus === "ASSOCIATION" ? <Details title="Agréments" value={value.associationTypes ? value.associationTypes.join(",") : "--"} /> : null}
        {value.legalStatus === "PUBLIC" ? (
          <div>
            <Details title="Type" value={value.structurePubliqueType || "--"} />
            {["Service de l'Etat", "Etablissement public"].includes(value.structurePubliqueType) ? (
              <Details title="Service" value={value.structurePubliqueEtatType || "--"} />
            ) : null}
          </div>
        ) : null}
        {value.legalStatus === "PRIVATE" ? <Details title="Type" value={value.structurePriveeType || "--"} /> : null}
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
          <tbody>
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
          </tbody>
        </table>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          {missionsInfo.count > 0 ? (
            <Link to={`/structure/${value._id}/missions`}>
              <Button className="btn-missions">Consulter toutes ses missions</Button>
            </Link>
          ) : null}
        </div>
      </Info>
      <Team referents={referents} />
      {parentStructure ? (
        <Info title={`Réseau national`}>
          <div style={{ marginTop: "1rem" }}>{parentStructure.name}</div>
        </Info>
      ) : null}
      <div>{/*Object.keys(value).map((e, k) => {
          return <div key={k}>{`${e}:${value[e]}`}</div>;
        }) */}</div>
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

const Subtitle = styled.div`
  color: rgb(113, 128, 150);
  font-weight: 400;
  text-transform: uppercase;
  font-size: 0.9rem;
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
  padding: 20px;
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
    margin-bottom: 12px;
  }
  .info {
    padding: 2rem 0;
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
`;

const Button = styled.button`
  margin: 0 0.5rem;
  align-self: flex-start;
  border-radius: 4px;
  padding: 5px;
  font-size: 12px;
  min-width: 100px;
  font-weight: 400;
  cursor: pointer;
  background-color: #fff;
  &.btn-blue {
    color: #646b7d;
    border: 1px solid #dcdfe6;
    :hover {
      color: rgb(49, 130, 206);
      border-color: rgb(193, 218, 240);
      background-color: rgb(234, 243, 250);
    }
  }
  &.btn-red {
    border: 1px solid #f6cccf;
    color: rgb(206, 90, 90);
    :hover {
      border-color: rgb(240, 218, 218);
      background-color: rgb(250, 230, 230);
    }
  }
  &.btn-missions {
    color: #646b7d;
    border: 1px solid #dcdfe6;
    font-size: 14px;
    padding: 5px 15px;
    :hover {
      color: rgb(49, 130, 206);
      border-color: rgb(193, 218, 240);
      background-color: rgb(234, 243, 250);
    }
  }
`;
