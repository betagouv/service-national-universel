import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import { HeroContainer, Hero, Content } from "../../../components/Content";
import api from "../../../services/api";
import { ENABLE_PM } from "../../../utils";
import Question from "../../../assets/question";
import Header from "./Header";
import { MdOutlineContentCopy } from "react-icons/md";
import { BsArrowUpRight } from "react-icons/bs";
import { environment } from "../../../config";

export default () => {
  const young = useSelector((state) => state.Auth.young);

  const [referentManagerPhase2, setReferentManagerPhase2] = useState();
  useEffect(() => {
    (async () => {
      const { ok, data } = await api.get(`/referent/manager_phase2/${young.department}`);
      if (ok) return setReferentManagerPhase2(data);
    })();
  }, []);
  const renderStep = () => {
    if (environment === "development")
      return (
        <div className="bg-white pb-5">
          <Header />
          <div className="mx-5 mt-10 ">
            <div>
              <div className="border border-gray-200 rounded-lg py-2 px-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold">Contacter mon référent </div>
                  <MdOutlineContentCopy className="text-gray-400" />
                </div>
                <div className="text-sm text-gray-600">André Dupont - andre.dupont@gmail.com</div>
              </div>
              <div className="border border-gray-200 rounded-lg  mt-3 py-2 px-3 flex items-start justify-between">
                <div className="font-bold ">J’ai des questions sur la mission d’intérêt général</div>
                <BsArrowUpRight className="text-gray-400 m-0.5 text-2xl" />
              </div>
              <div className="border border-gray-200 rounded-lg   mt-3 py-2 px-3  flex items-start justify-between">
                <div className="font-bold">J’ai des questions sur la reconnaissance d’engagement</div>
                <BsArrowUpRight className="text-gray-400 m-0.5 text-2xl" />
              </div>
            </div>
            <div className="border border-gray-200 rounded-lg mt-3  py-2 px-3 flex items-center">
              <div className="mr-3">
                <img src={require("../../../assets/prépa.png")} height={96} />
              </div>
              <div className="w-full">
                <div className="flex items-center justify-between">
                  <div className="font-bold"> Partez en préparation militaire</div>
                  <BsArrowUpRight className="text-gray-400 m-0.5 " />
                </div>
                <div className="text-sm text-gray-600">Partez à la découverte des métiers de la Défense en réalisant une préparation militaire au sein d'un corps d’armée</div>
              </div>
            </div>
            <div className="mt-4 mb-2">Vous avez déjà fait preuve de solidarité ?</div>
            <div className="border-0 rounded-lg shadow-lg items-center">
              <img src={require("../../../assets/phase2MobileReconnaissance.png")} className="rounded-lg w-full" />
              <div className="px-3 pb-4">
                <div className="font-bold text-lg ">Demandez la reconnaissance d’un engagement déjà réalisé</div>
                <div className="text-gray-600 text-sm mt-2 mb-3">Faîtes reconnaitre comme mission d’intérêt général un engagement déjà réalisé au service de la société</div>
                <div className=" rounded-lg text-blue-700 text-center py-1 border-blue-700 border ">Faire ma demande</div>
              </div>
            </div>
          </div>
        </div>
      );

    return (
      <>
        <HeroContainer>
          <Hero>
            <div className="content">
              <h1>
                Réalisez vos <strong>84 heures de mission d&apos;intérêt général</strong>
              </h1>
              <p>
                Partez à la découverte de l&apos;engagement en réalisant 84 heures de mission d&apos;intérêt général, au sein d&apos;une ou plusieurs structures, en contribuant à
                leurs activités concrètes !
              </p>
              <Separator />
              <p>
                <strong>Vos missions d&apos;intérêt général</strong>
                <br />
                {young.phase2NumberHoursDone ? (
                  <>
                    Vous avez réalisé {young.phase2NumberHoursDone} heures de mission d&apos;intérêt général.
                    <br />
                  </>
                ) : null}
                <Link to="/preferences">Renseigner mes préférences {">"}</Link>
                <br />
                <Link to="/mission">Trouver une mission {">"}</Link>
                {ENABLE_PM && (
                  <>
                    <br />
                    <Link to="/ma-preparation-militaire">Ma préparation militaire {">"}</Link>
                  </>
                )}
                <br />
                <Link to="/candidature">Suivez vos candidatures {">"}</Link>
              </p>
            </div>
            <div className="thumb" />
          </Hero>
        </HeroContainer>
        <GoodToKnow className="flex items-center justify-center">
          <Question class="h-12 w-12 border p-2 rounded-xl" />
          <div className="ml-3">
            <p className="!font-bold !text-black">Vous avez des questions sur la mission d&apos;intérêt général ?</p>
            <a href={`https://support.snu.gouv.fr/base-de-connaissance/phase-2-la-mission-dinteret-general-1`} target="_blank" rel="noreferrer">
              Consulter notre <span className="!text-snu-purple-200">base&nbsp;de&nbsp;connaissance&nbsp;›</span>
            </a>
          </div>
        </GoodToKnow>
        {referentManagerPhase2 ? (
          <HeroContainer>
            <Hero>
              <Content style={{ width: "100%" }}>
                <h2>Contactez votre référent pour plus d’informations</h2>
                {referentManagerPhase2?.firstName} {referentManagerPhase2?.lastName} -{" "}
                <StyledA href={`mailto:${referentManagerPhase2?.email}`}>{referentManagerPhase2?.email}</StyledA>
              </Content>
            </Hero>
          </HeroContainer>
        ) : null}
      </>
    );
  };

  return renderStep();
};
const Separator = styled.hr`
  margin: 2.5rem 0;
  height: 1px;
  border-style: none;
  background-color: #e5e7eb;
`;
const StyledA = styled.a`
  font-size: 1rem;
  color: #5145cd;
  cursor: pointer;
  :hover {
    text-decoration: underline;
  }
`;

const GoodToKnow = styled.div`
  svg {
    min-width: 48px;
  }
`;
