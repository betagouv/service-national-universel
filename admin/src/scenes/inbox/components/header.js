import React from "react";
import styled from "styled-components";
import MailCloseIcon from "../../../components/MailCloseIcon";
import MailOpenIcon from "../../../components/MailOpenIcon";
import SuccessIcon from "../../../components/SuccessIcon";
import { ticketStateIdByName } from "../../../utils";

export default ({ overview }) => {
  return (
    <NotifcationContainer>
      <Notification>
        <MailCloseIcon color="#F1545B" style={{ margin: 0, padding: "5px" }} />
        <NotificationNumber>{overview[ticketStateIdByName("nouveau")] || 0}</NotificationNumber>non&nbsp;lu(s)
      </Notification>
      <VL></VL>
      <Notification>
        <MailOpenIcon color="#F8B951" style={{ margin: 0, padding: "5px" }} />
        <NotificationNumber>{overview[ticketStateIdByName("ouvert")] || 0}</NotificationNumber>ouvert(s)
      </Notification>
      <VL></VL>
      <Notification>
        <SuccessIcon color="#6BC762" style={{ margin: 0, padding: "5px" }} />
        <NotificationNumber>{overview[ticketStateIdByName("fermé")] || 0}</NotificationNumber>fermé(s)
      </Notification>
    </NotifcationContainer>
  );
};

export const NotifcationContainer = styled.div`
  flex: 1;
  display: flex;
  margin: 1rem;
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
