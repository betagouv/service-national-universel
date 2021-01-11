import React, { useState } from "react";
import { Link, Route, Switch } from "react-router-dom";
import styled from "styled-components";
import { useSelector, useDispatch } from "react-redux";

import { setUser } from "../../redux/auth/actions";

import Profil from "./profil";
import Structure from "./structure";
import Address from "./address";
import SideBar from "./sideBar";
import TopNav from "./topNav";

import api from "../../services/api";

const PROFIL = "profil";
const STRUCTURE = "structure";
const ADDRESS = "address";

export default ({}) => {
  const [step, setStep] = useState("profil");
  const dispatch = useDispatch();

  async function onCreate() {
    const { data } = await api.post(`/structure`, { name: "MA NOUVELLE STRUCTURE" });
    const { data: u } = await api.put(`/referent`, { structureId: data._id });
    dispatch(setUser(u));
  }

  return (
    <Wrapper>
      <SideBar step={step} onChange={(e) => setStep(e)} />
      <Main>
        <TopNav value={step} onChange={(e) => setStep(e)} />
        {step === PROFIL && <Profil onChange={() => setStep(STRUCTURE)} />}
        {step === STRUCTURE && <Structure onChange={() => setStep(ADDRESS)} />}
        {step === ADDRESS && <Address onChange={() => onCreate()} />}
      </Main>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden;
`;

const Main = styled.div`
  background-color: #fff;
  flex: 0 0 75%;
  max-width: 75%;
  max-height: 100%;
  overflow-y: auto;
  hr {
    border-top: 1px solid #e2e8ef;
    margin: 0;
  }
`;
