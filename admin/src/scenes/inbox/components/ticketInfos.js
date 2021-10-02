import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import styled from "styled-components";

import api from "../../../services/api";
import { ticketStateNameById } from "../../../utils/zammad";

import Panel from "../../../scenes/volontaires/panel";

export default ({ ticket }) => {
  const [user, setUser] = useState([]);
  const history = useHistory();

  useEffect(() => {
    (async () => {
      if (!ticket?.articles?.length) return;
      const email = ticket.articles[0].created_by;
      const { data } = await api.get(`/young?email=${email}`);
      setUser(data);
    })();
  }, [ticket]);

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
      <RightPanelContainer>
        <RightPanelHeader>Informations volontaire</RightPanelHeader>
        <div>
          <p>Veuiller sélectionner un ticket</p>
        </div>
      </RightPanelContainer>
    );

  return (
    <RightPanelContainer>
      {ticket === null ? (
        <div />
      ) : (
        <>
          <RightPanelHeader>
            {ticketStateNameById(ticket?.state_id) !== "fermé" ? (
              <div style={{ display: "flex", justifyContent: "center", alignContent: "center" }}>
                <button className="button" onClick={resolveTicket}>
                  Résoudre le ticket
                </button>
              </div>
            ) : null}
            <h4 className="title">Informations volontaire</h4>
          </RightPanelHeader>
          <PanelflatDesign value={user} hideCloseButton />
        </>
      )}
    </RightPanelContainer>
  );
};

const RightPanelContainer = styled.div`
  background-color: #fff;
`;

const RightPanelHeader = styled.div`
  padding: 1rem;
`;

const PanelflatDesign = styled(Panel)`
  box-shadow: none;
`;
