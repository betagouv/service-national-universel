import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import MailCloseIcons from "../../../components/MailCloseIcons";
import MailOpenIcons from "../../../components/MailOpenIcons";

export default () => {
  return (
    <NotifcationContainer>
      <Notification>
        <MailCloseIcons style={{ margin: 0 }} />
        <NotificationNumber>3</NotificationNumber> new&nbsp;tickets
      </Notification>
      <VL></VL>
      <Notification>
        <MailOpenIcons style={{ margin: 0 }} />
        <NotificationNumber>3</NotificationNumber> opened&nbsp;tickets
      </Notification>
      <VL></VL>
      <Notification>
        <MailOpenIcons style={{ margin: 0 }} />
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

export const Notification = styled.p`
  flex: 1;
  display: flex;
  padding: 10px;
  margin: 0px;
  width: max-content;
`;

export const NotificationNumber = styled.span`
  font-weight: bold;
`;

export const VL = styled.div`
  border-left: 1px solid rgba(0, 0, 0, 0.09);
`;
