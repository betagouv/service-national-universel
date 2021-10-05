import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { translate, ROLES, ES_NO_LIMIT } from "../../utils";
import api from "../../services/api";
import { setUser } from "../../redux/auth/actions";
import PanelActionButton from "../../components/buttons/PanelActionButton";
import Panel, { Info, Details } from "../../components/Panel";
import styled from "styled-components";

// Sorry about that: return true, return false, false, true, false.
function canModify(user, value) {
  if (user.role === ROLES.ADMIN) return true;
  // https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
  if (user.role === ROLES.REFERENT_REGION) {
    if ([ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(value.role) && user.region === value.region) return true;
    return false;
  }
  if (user.role === ROLES.REFERENT_DEPARTMENT) {
    if (user.role === value.role && user.department === value.department) return true;
    return false;
  }
  return false;
}

export default ({ onChange, value }) => {
  if (!value) return <div />;
  const [structure, setStructure] = useState();
  const [missionsInfo, setMissionsInfo] = useState({ count: "-", placesTotal: "-" });
  const [referentDepartment, setReferentDepartment] = useState();
  const [structureTeam, setStructureTeam] = useState([]);
  const user = useSelector((state) => state.Auth.user);
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    setStructure(null);
    setMissionsInfo({ count: "-", placesTotal: "-" });
    setStructureTeam([]);

    (async () => {
      if (!value.structureId) return;
      const { ok, data, code } = await api.get(`/structure/${value.structureId}`);
      if (!ok) return toastr.error("Oups, une erreur est survnue lors de la récupération de la structure", translate(code));
      return setStructure(data);
    })();
    (async () => {
      if (!value.structureId) return;
      const { responses: missionResponses } = await api.esQuery("mission", {
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": value.structureId } }] } },
      });
      if (missionResponses.length) {
        setMissionsInfo({
          count: missionResponses[0].hits.hits.length,
          placesTotal: missionResponses[0].hits.hits.reduce((acc, e) => acc + e._source.placesTotal, 0),
          placesLeft: missionResponses[0].hits.hits.reduce((acc, e) => acc + e._source.placesLeft, 0),
        });
      }
    })();
  }, [value]);

  useEffect(() => {
    if (!structure) return;
    (async () => {
      const { responses: referentResponses } = await api.esQuery("referent", {
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": structure._id } }] } },
        size: ES_NO_LIMIT,
      });
      if (referentResponses.length) {
        setStructureTeam(referentResponses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })));
      }
    })();

    if (!structure?.department) return;
    (async () => {
      const { responses: referentDepartementResponses } = await api.esQuery("referent", {
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "department.keyword": structure.department } }, { term: { "role.keyword": "referent_department" } }] } },
      });
      if (referentDepartementResponses.length) {
        setReferentDepartment({ _id: referentDepartementResponses[0].hits.hits[0]._id, ...referentDepartementResponses[0].hits.hits[0]._source });
      }
    })();
  }, [structure]);

  const handleImpersonate = async () => {
    try {
      const { ok, data, token } = await api.post(`/referent/signin_as/referent/${value._id}`);
      if (!ok) return toastr.error("Oops, une erreur est survenu lors de la masquarade !", translate(e.code));
      history.push("/dashboard");
      if (token) api.setToken(token);
      if (data) dispatch(setUser(data));
    } catch (e) {
      console.log(e);
      toastr.error("Oops, une erreur est survenu lors de la masquarade !", translate(e.code));
    }
  };

  return (
    <Panel>
      <div className="info">
        <div style={{ display: "flex" }}>
          <div className="title">{`${value.firstName} ${value.lastName}`}</div>
          <div className="close" onClick={onChange} />
        </div>
        {canModify(user, value) && (
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <Link to={`/user/${value._id}`}>
              <PanelActionButton icon="eye" title="Consulter" />
            </Link>
            <PanelActionButton onClick={handleImpersonate} icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" />
            {structure ? (
              <Link to={`/structure/${structure._id}`}>
                <PanelActionButton icon="eye" title="Voir la structure" />
              </Link>
            ) : null}
          </div>
        )}
      </div>
      <Info title="Coordonnées">
        <Details title="E-mail" value={value.email} copy />
      </Info>
      <Info title="Informations">
        <Details title="Rôle" value={translate(value.role)} />
        <Details title="Fonction" value={translate(value.subRole)} />
        <Details title="Région" value={value.region} />
        <Details title="Département" value={value.department} />
      </Info>
      {structure ? (
        <React.Fragment>
          <Info title="Structure">
            <div className="detail">
              <div className="detail-title">Nom :</div>
              <Link to={`/structure/${structure._id}`}>
                <div className="detail-text">{structure.name}</div>
              </Link>
            </div>
            <Details title="Région" value={structure?.region} />
            <Details title="Dép." value={structure?.department} />
            <Details title="Référent Dép." value={referentDepartment?.email} copy />
            {structureTeam.length ? null : (
              <div className="detail">
                <div className="detail-title">Équipe :</div>
                <div className="detail-text">Aucun compte trouvé</div>
              </div>
            )}
            {structureTeam.map((referent, index) =>
              index === 0 ? (
                <div className="detail" key={referent._id}>
                  <div className="detail-title">Équipe :</div>
                  <TeamUser referent={referent} />
                </div>
              ) : (
                <div className="detail" key={referent._id}>
                  <div className="detail-title"></div>
                  <TeamUser referent={referent} />
                </div>
              )
            )}
            <Details title="Missions dispo." value={missionsInfo.count} />
            <Details title="Places restantes" value={missionsInfo.placesLeft} />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "10px" }}>
              {missionsInfo.count > 0 ? (
                <Link to={`/structure/${value._id}/missions`}>
                  <Button className="btn-missions">Consulter toutes les missions</Button>
                </Link>
              ) : null}
            </div>
          </Info>
        </React.Fragment>
      ) : null}
      {/* <div>
        {Object.keys(value).map((e) => {
          return <div>{`${e}:${value[e]}`}</div>;
        })}
      </div> */}
    </Panel>
  );
};
const TeamUser = ({ referent }) => {
  return (
    <Link to={`/user/${referent._id}`} key={referent._id}>
      <div className="detail-text" key={referent._id}>
        <div>{`${referent.firstName} ${referent.lastName}`}</div>
      </div>
    </Link>
  );
};

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
