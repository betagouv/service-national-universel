import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

import api from "../../../services/api";
import translateState from "../../../utils/translateTickets";

export default ({ ticket }) => {
  const [user, setUser] = useState([]);

  useEffect(() => {
    (async () => {
      if (!ticket?.articles.length) return;
      console.log(ticket);
      const email = "adolphie.laine14@yahoo.fr"; //ticket.articles[0].created_by;
      const { data } = await api.get(`/young?email=${email}`);
      setUser(data);
    })();
  }, [ticket]);

  const resolveTicket = async () => {
    const response = await api.put(`/support-center/ticket/${ticket.id}`, {
      state: "closed",
    });
    if (!response.ok) console.log(response.status, "error");
    if (response.ok) toastr.success('Ticket résolu !');
  }

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
      <h4 className="title">Informations volontaire</h4>
      <div>
        <p className="subtitle">État du ticket :</p>
        <p className="info">
          {translateState(ticket?.state_id)}
        </p>
      </div>
      <div>
        <p className="subtitle">Nom complet :</p>
        <p className="info">
          {user.firstName} {user.lastName}
        </p>
      </div>
      <div>
        <p className="subtitle">E-mail :</p>
        <p className="info">{user.email}</p>
      </div>
      <div>
        <p className="subtitle">Département :</p>
        <p className="info">{user.department}</p>
      </div>
      <div>
        <p className="subtitle">Centre de cohésion :</p>
        <p className="info">{user.cohesionCenter}</p>
      </div>
      <div>
        <p className="subtitle">Status phase 1 :</p>
        <p className="info">{user.phase1Status}</p>
      </div>
      <div>
        <p className="subtitle">Status phase 2 :</p>
        <p className="info">{user.phase2Status}</p>
      </div>
      <div>
        <p className="subtitle">Status phase 3 :</p>
        <p className="info">{user.phase3Status}</p>
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignContent: "center" }}>
        <button className="button"
          onClick={resolveTicket}
        >Résoudre le ticket</button>
      </div>
    </HeroContainer>
  );
};

export const HeroContainer = styled.div`
  flex: 1;
  padding: 1rem;

  background-color: #fff;
  max-width: 300px;
  min-width: 300px;
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
    font-size: 0.875rem;
    line-height: 1.25rem;
    margin-bottom: 22px;
  }

  .button {
    margin-top: 50px;
    padding: 10px;
    border-width: 0px;
    background: #6bc762;
    border-radius: 10px;
    width: 100%;
    color: white;
  }
`;
