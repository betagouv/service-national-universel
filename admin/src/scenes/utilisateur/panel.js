import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { translate, ROLES, ES_NO_LIMIT, copyToClipboard, canUpdateReferent } from "../../utils";
import api from "../../services/api";
import { setUser } from "../../redux/auth/actions";
import PanelActionButton from "../../components/buttons/PanelActionButton";
import Panel, { Info, Details } from "../../components/Panel";
import styled from "styled-components";

export default ({ onChange, value }) => {
  if (!value) return <div />;
  const [structure, setStructure] = useState();
  const [missionsInfo, setMissionsInfo] = useState({ count: "-", placesTotal: "-" });
  const [referentsDepartment, setReferentsDepartment] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const user = useSelector((state) => state.Auth.user);
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    setStructure(null);
    setMissionsInfo({ count: "-", placesTotal: "-" });
    setTeamMembers([]);
    setReferentsDepartment([]);
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
        setTeamMembers(referentResponses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })));
      }
    })();

    if (!structure?.department) return;
    (async () => {
      const { responses: referentDepartementResponses } = await api.esQuery("referent", {
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "department.keyword": structure.department } }, { term: { "role.keyword": "referent_department" } }] } },
      });
      if (referentDepartementResponses.length) {
        setReferentsDepartment(referentDepartementResponses[0].hits.hits.map((e) => ({ _id: e._id, ...e._source })));
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
        {canUpdateReferent({ actor: user, originalTarget: value, structure: structure }) && (
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <Link to={`/user/${value._id}`}>
              <PanelActionButton icon="eye" title="Consulter" />
            </Link>
            {user.role !== ROLES.REFERENT_REGION && user.role !== ROLES.REFERENT_DEPARTMENT ? (
              <PanelActionButton onClick={handleImpersonate} icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" />
            ) : null}
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
              <div style={{ display: "flex" }}>
                <div className="detail-text">{structure.name}</div>
                <Link to={`/structure/${structure._id}`}>
                  <IconLink />
                </Link>
              </div>
            </div>
            <Details title="Région" value={structure?.region} />
            <Details title="Dép." value={structure?.department} />
            <div className="detail" style={{ alignItems: "flex-start" }}>
              <div className="detail-title">Référents Dép. :</div>
              {!referentsDepartment.length ? (
                <div className="detail-text">Aucun référent trouvé</div>
              ) : (
                <div className="detail-text">
                  <ul>
                    {referentsDepartment.map((referent) => (
                      <li key={referent._id} style={{ display: "flex", alignItems: "center" }}>
                        {referent.email}
                        <IconCopy
                          onClick={() => {
                            copyToClipboard(referent.email);
                            toastr.success(`'${referent.email}' a été copié dans le presse papier.`);
                          }}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="detail" style={{ alignItems: "flex-start" }}>
              <div className="detail-title">Équipe :</div>
              {!teamMembers.length ? (
                <div className="detail-text">Aucun compte trouvé</div>
              ) : (
                <div className="detail-text">
                  <ul>
                    {teamMembers.map((member) => (
                      <TeamMember key={member._id}>
                        {`${member.firstName} ${member.lastName}`}
                        <Link to={`/user/${member._id}`}>
                          <IconLink />
                        </Link>
                      </TeamMember>
                    ))}
                  </ul>
                </div>
              )}
            </div>
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

const IconLink = styled.div`
  margin: 0 0.5rem;
  width: 18px;
  height: 18px;
  background: ${`url(${require("../../assets/link.svg")})`};
  background-repeat: no-repeat;
  background-position: center;
  background-size: 15px 15px;
`;

const IconCopy = styled.div`
  cursor: pointer;
  margin: 0 0.5rem;
  width: 15px;
  height: 15px;
  background: ${`url(${require("../../assets/copy.svg")})`};
  background-repeat: no-repeat;
  background-position: center;
  background-size: 15px 15px;
`;

const TeamMember = styled.li`
  display: flex;
  align-items: center;
`;
