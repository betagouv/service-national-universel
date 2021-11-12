import React from "react";
import styled from "styled-components";
import MailCloseIcon from "../../../components/MailCloseIcon";
import MailOpenIcon from "../../../components/MailOpenIcon";
import SuccessIcon from "../../../components/SuccessIcon";
import { useSelector } from "react-redux";

export default () => {
  const openedTickets = useSelector((state) => state.Tickets.open);
  const newTickets = useSelector((state) => state.Tickets.new);
  const closedTickets = useSelector((state) => state.Tickets.closed);
  return (
    <HeaderContainer>
      <NotifcationContainer>
        <Notification>
          <MailCloseIcon color="#F1545B" style={{ margin: 0, padding: "5px" }} />
          <NotificationNumber>{newTickets}</NotificationNumber>non&nbsp;lu(s)
        </Notification>
        <VL></VL>
        <Notification>
          <MailOpenIcon color="#F8B951" style={{ margin: 0, padding: "5px" }} />
          <NotificationNumber>{openedTickets}</NotificationNumber>ouvert(s)
        </Notification>
        <VL></VL>
        <Notification>
          <SuccessIcon color="#6BC762" style={{ margin: 0, padding: "5px" }} />
          <NotificationNumber>{closedTickets}</NotificationNumber>archivé(s)
        </Notification>
      </NotifcationContainer>
      <div style={{ display: "flex", justifyContent: "center", alignContent: "center" }}>
        <a href="https://support.snu.gouv.fr/help/fr-fr" className="button" target="_blank">
          Base de connaissance
        </a>
      </div>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  .button {
    padding: 10px;
    border-width: 0px;
    background: #5245cc;
    border-radius: 10px;
    width: 100%;
    color: white;
    :hover {
      color: #fff;
      background: #463bad;
    }
  }
`;

export const NotifcationContainer = styled.div`
  display: flex;
  @media (max-width: 768px) {
    padding: 1rem 0;
  }
  /* white */
  background: #ffffff;
  /* shadow */
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
  border-radius: 8px;

  width: fit-content;
`;

export const Notification = styled.div`
  flex: 1;
  display: flex;
  padding: 10px;
  margin: 0px;
  align-items: center;
  color: #666667;
`;

export const NotificationNumber = styled.span`
  font-weight: bold;
  margin: 0 3px;
  color: #242526;
`;

export const VL = styled.div`
  border-left: 1px solid rgba(0, 0, 0, 0.09);
`;
