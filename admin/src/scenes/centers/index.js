import React from "react";
import { Switch, Route, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import styled from "styled-components";

import InfoIcon from "../../assets/InfoIcon";
import List from "./list";
import Edit from "./edit";
import View from "./view";

export default function CenterIndex() {
  const user = useSelector((state) => state.Auth.user);
  const history = useHistory();
  if (user?.role !== "admin") {
    history.push("/");
    return null;
  }

  return (
    <>
      <Infos>
        ⚠️
        <InfoIcon color="#32257F" />
        <p> Chantier en cours...</p>⚠️
      </Infos>
      <Switch>
        <Route path="/centre/nouveau" component={Edit} />
        <Route path="/centre/:id/edit" component={Edit} />
        <Route path="/centre/:id" component={View} />
        <Route path="/centre" component={List} />
      </Switch>
    </>
  );
}

const Infos = styled.section`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  background: rgba(79, 70, 229, 0.1);
  padding: 1rem;
  color: #32257f;
  border-radius: 6px;
  svg {
    margin-top: 4px;
  }
  p {
    font-size: 1.1rem;
    margin: 0;
  }
`;
