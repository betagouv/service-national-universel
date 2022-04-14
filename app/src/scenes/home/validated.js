import React, { useState } from "react";
import { useSelector } from "react-redux";
import { HeroContainer, Hero, Content, Alert } from "../../components/Content";
import { Link } from "react-router-dom";
import clock from "../../assets/clock.svg";
import DownloadButton from "../phase1/components/DownloadButton";

export default function Validated() {
  const young = useSelector((state) => state.Auth.young);
  const is2020 = young.cohort === "2020";
  const [showAlert, setShowAlert] = useState(!is2020);

  return (
    <HeroContainer>
      <Hero>
        {showAlert && (
          <Alert color="#31c48d">
            <div className="text">
              <strong>INSCRIPTION VALIDÉE</strong>
            </div>
            <img src={require("../../assets/close.svg")} height={15} width={15} onClick={() => setShowAlert(false)} />
          </Alert>
        )}
        <Content showAlert={showAlert}>
          <h1>
            <strong>{young.firstName},</strong> bienvenue sur votre compte volontaire.
          </h1>
          <section className="p-4">
            <section className="mt-6 mb-10">
              <strong className="text-xl mb-4 text-[#242526]">Félicitations, vous allez pouvoir débuter prochainement votre parcours SNU.</strong>
              <br />
              {young.statusPhase1 === "WAITING_AFFECTATION" && (
                <article className="flex text-sm leading-5 mt-4">
                  <img src={clock} alt="clock icon" className="w-10 h-10 mr-2" />
                  <p>Vous êtes actuellement en attente d&apos;affectation à un lieu pour votre séjour de cohésion.</p>
                </article>
              )}
            </section>
            <Link to="/phase1">
              <DownloadButton text="Fournir mes documents justificatifs" />
            </Link>
          </section>
        </Content>
        <div className="thumb" />
      </Hero>
    </HeroContainer>
  );
}
