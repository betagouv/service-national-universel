import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import MailCloseIcon from "../../../components/MailCloseIcon";
import MailOpenIcon from "../../../components/MailOpenIcon";
import SuccessIcon from "../../../components/SuccessIcon";

export default () => {
  return (
    <NotifcationContainer>
      <Notification>
        <MailCloseIcon color="#F8B951" style={{ margin: 0, padding: "5px" }} />
        <NotificationNumber>3</NotificationNumber> new&nbsp;tickets
      </Notification>
      <VL></VL>
      <Notification>
        <MailOpenIcon color="#F1545B" style={{ margin: 0, padding: "5px" }} />
        <NotificationNumber>3</NotificationNumber> opened&nbsp;tickets
      </Notification>
      <VL></VL>
      <Notification>
        <SuccessIcon color="#6BC762" style={{ margin: 0, padding: "5px" }} />
        <NotificationNumber>3</NotificationNumber> closed&nbsp;tickets
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
  /* sgadow */
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
