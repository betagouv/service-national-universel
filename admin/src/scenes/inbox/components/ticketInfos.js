import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { NavLink, Link, useHistory } from "react-router-dom";
import styled from "styled-components";

import PanelActionButton from "../../../components/buttons/PanelActionButton";
import api from "../../../services/api";
import { ticketStateNameById, copyToClipboard, translate } from "../../../utils";
import Loader from "../../../components/Loader";
import { appURL, adminURL } from "../../../config";

export default ({ ticket }) => {
  const [user, setUser] = useState([]);
  const history = useHistory();
  const [referentManagerPhase2, setReferentManagerPhase2] = useState();

  useEffect(() => {
    (async () => {
      if (!ticket?.articles?.length) return;
      const email = ticket.articles[0].created_by;
      const { data } = await api.get(`/young?email=${email}`);
      setUser(data);
    })();
  }, [ticket]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { ok, data } = await api.get(`/referent/manager_phase2/${user.department}`);
      if (ok) return setReferentManagerPhase2(data);
      setReferentManagerPhase2(null);
    })();
    return () => setReferentManagerPhase2();
  }, [user]);

  const resolveTicket = async () => {
    const response = await api.put(`/support-center/ticket/${ticket.id}`, {
      state: "closed",
    });
    if (!response.ok) console.log(response.status, "error");
    if (response.ok) toastr.success("Ticket résolu !");
    history.go(0);
  };

  if (!user)
    return (
      <HeroContainer>
        <h4>Informations volontaire</h4>
        <div>
          <p>Veuiller sélectionner un ticket</p>
        </div>
      </HeroContainer>
    );

  return (
    <HeroContainer>
      {ticket === null ? (
        <div />
      ) : (
        <>
          {ticketStateNameById(ticket?.state_id) !== "fermé" ? (
            <div style={{ display: "flex", justifyContent: "center", alignContent: "center" }}>
              <button className="button" onClick={resolveTicket}>
                Résoudre le ticket
              </button>
            </div>
          ) : null}
          <h4 className="title">Informations volontaire</h4>
          <div style={{ marginBottom: "1rem" }}>
            <a href={`${adminURL}/volontaire/${user._id}`} className="name">
              {user.firstName} {user.lastName}
            </a>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            <Link to={`/volontaire/${user._id}`}>
              <PanelActionButton icon="eye" title="Consulter" />
            </Link>
            <Link to={`/volontaire/${user._id}/edit`}>
              <PanelActionButton icon="pencil" title="Modifier" />
            </Link>
            <a href={`${appURL}/auth/connect?token=${api.getToken()}&young_id=${user._id}`}>
              <PanelActionButton icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" />
            </a>
          </div>
          <Item title="E-mail" content={user.email} copy />
          <Item title="Département" content={user.department} />
          <Item title="Région" content={user.region} />
          <Item title="Centre de cohésion" content={user.cohesionCenterName} />
          <Item title="Status phase 1" content={user.statusPhase1} />
          <Item title="Status phase 2" content={user.statusPhase2} />
          <Item title="Contact phase 2" content={referentManagerPhase2?.email || (referentManagerPhase2 !== undefined && "Non trouvé") || "Chargement..."} copy />
          <Item title="Status phase 3" content={user.statusPhase3} />
        </>
      )}
    </HeroContainer>
  );
};

const Item = ({ title, content, copy = false }) => {
  if (!content) return null;
  return (
    <div>
      <p className="subtitle">{title}&nbsp;:</p>
      <p className="info">
        {translate(content)}
        {copy ? (
          <div
            className="icon"
            icon={require(`../../../assets/copy.svg`)}
            onClick={() => {
              copyToClipboard(content);
              toastr.success(`'${title}' a été copié dans le presse papier.`);
            }}
          />
        ) : null}
      </p>
    </div>
  );
};

export const HeroContainer = styled.div`
  flex: 1;
  padding: 1rem;
  border-top: 1px solid #e4e4e7;
  border-bottom: 1px solid #e4e4e7;
  background-color: #fff;
  max-width: 300px;
  min-width: 300px;
  overflow-y: scroll;
  @media (max-width: 768px) {
    padding: 1rem 0;
  }

  .title {
    font-style: normal;
    font-weight: bold;
    font-size: 1.125rem;
    line-height: 1.75rem;
  }

  .subtitle {
    font-size: 0.75rem;
    line-height: 1rem;
    color: #979797;
    margin: 0px;
  }

  .info {
    display: flex;
    font-size: 0.875rem;
    line-height: 1.25rem;
    margin-bottom: 22px;
    .icon {
      cursor: pointer;
      margin: 0 0.5rem;
      width: 15px;
      height: 15px;
      background: ${`url(${require("../../../assets/copy.svg")})`};
      background-repeat: no-repeat;
      background-position: center;
      background-size: 15px 15px;
    }
  }

  .name {
    font-size: 1rem;
    font-weight: bold;
  }

  .button {
    margin-bottom: 1rem;
    padding: 10px;
    border-width: 0px;
    background: #6bc762;
    border-radius: 10px;
    width: 100%;
    color: white;
  }
`;
