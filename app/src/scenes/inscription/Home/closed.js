import React, { useState } from "react";
import styled from "styled-components";
import validator from "validator";

import plausibleEvent from "../../../services/plausible";
import Header from "./header";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import api from "../../../services/api";
import { toastr } from "react-redux-toastr";
import { translate, urlWithScheme } from "../../../utils";
import ModalButton from "../../../components/buttons/ModalButton";

export default function Closed({ location }) {
  const [mail, setMail] = useState();
  const [birthdateAt, setBirthdateAt] = useState();

  const handleClick = async () => {
    if (!mail) return toastr.error("Formulaire incorrect", 'Le champs "e-mail" est obligatoire', { timeOut: 3000 });
    if (!birthdateAt) return toastr.error("Formulaire incorrect", 'Le champs "date de naissance" est obligatoire', { timeOut: 3000 });
    if (!validator.isEmail(mail))
      return toastr.error("Oups, une erreur s'est produite", "Il semblerait que le format de votre mail soit invalide. Merci de réessayer", { timeOut: 3000 });
    if (!/\d{2}\/\d{2}\/(\d{4}|\d{2})/.test(birthdateAt))
      return toastr.error(
        "Oups, une erreur s'est produite",
        "Il semblerait que le format de votre date de naissance soit invalide. Merci de réessayer en utilisant le format jj/mm/aaaa",
        { timeOut: 3000 },
      );
    const { ok, code } = await api.post("/waiting-list", { mail, birthdateAt });
    if (!ok) toastr.error("Oups, une erreur s'est produite", translate(code));
    else {
      setMail("");
      setBirthdateAt("");
      toastr.success("Nous avons bien pris en compte votre intérêt");
    }
  };

  return (
    <div>
      <Header showMessage={false} location={location} />
      <Wrapper>
        <TitleContainer>
          <TopTitle className="mobileOnly">inscription 2022</TopTitle>
          <Title>Participez au SNU</Title>
          <a
            className="flex items-center justify-center bg-white mb-4 w-12 h-12 rounded-full md:h-20 md:w-20"
            onClick={() => plausibleEvent("LP - Video")}
            href="https://www.youtube.com/watch?v=rE-8fe9xPDo"
            target="_blank"
            rel="noreferrer">
            <svg width="20" height="26" viewBox="0 0 20 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19.1346 11.0998L3.79966 0.640236C2.49183 -0.253291 0.722412 0.719077 0.722412 2.32217V23.2149C0.722412 24.8443 2.49183 25.7904 3.79966 24.8969L19.1346 14.4373C20.2886 13.6752 20.2886 11.8882 19.1346 11.0998Z"
                fill="#D33C4A"
              />
            </svg>
          </a>
        </TitleContainer>
        <div className="flex-1 z-10">
          <p className="text-white mb-4 font-medium text-2xl md:text-base">Une aventure en trois phases</p>
          {/* Desktop View Cards*/}
          <div className=" justify-around hidden md:flex">
            <div className="w-[20rem] lg:w-[25rem] ">
              <CardPhase
                onClick={() => plausibleEvent("LP - Phase 1")}
                upText="phase 1"
                title="Le séjour de cohésion"
                downText="3 sessions possibles en février ou avril (selon votre zone scolaire), juin et juillet 2023"
                to="https://www.snu.gouv.fr/le-sejour-de-cohesion-26"
              />
            </div>
            <div className="w-[20rem] lg:w-[25rem]">
              <CardPhase
                onClick={() => plausibleEvent("LP - Phase 2")}
                upText="phase 2"
                title="La mission d'intérêt général"
                downText="84 heures à réaliser au cours de l'année suivant le séjour de cohésion"
                to="https://www.snu.gouv.fr/la-mission-d-interet-general-27"
              />
            </div>
            <div className="w-[20rem] lg:w-[25rem]  ">
              <CardPhase
                onClick={() => plausibleEvent("LP - Phase 3")}
                upText="phase 3 - facultative"
                title="L'engagement"
                downText="Mission facultative de 3 mois minimum"
                to="https://www.snu.gouv.fr/l-engagement-28"
              />
            </div>
          </div>

          {/* Mobile View Carusel*/}
          <Carousel className="flex md:hidden p-3" showThumbs={false} showStatus={false} showArrows={true}>
            <CardPhase
              onClick={() => plausibleEvent("LP - Phase 1")}
              upText="phase 1"
              title="Le séjour de cohésion"
              downText="3 sessions possibles en février ou avril (selon votre zone scolaire), juin et juillet 2023"
              to="https://www.snu.gouv.fr/le-sejour-de-cohesion-26"
            />
            <CardPhase
              onClick={() => plausibleEvent("LP - Phase 2")}
              upText="phase 2"
              title="La mission d'intérêt général"
              downText="84 heures à réaliser au cours de l'année suivant le séjour de cohésion"
              to="https://www.snu.gouv.fr/la-mission-d-interet-general-27"
            />
            <CardPhase
              onClick={() => plausibleEvent("LP - Phase 3")}
              upText="phase 3 - facultative"
              title="L'engagement"
              downText="Mission facultative de 3 mois minimum"
              to="https://www.snu.gouv.fr/l-engagement-28"
            />
          </Carousel>
          {/* Start Button Desktop View */}
          <div className="z-50  hidden md:block">
            <button disabled className="uppercase p-3 pr-4 mt-[3px] lg:mt-[2rem] text-white bg-[#acaaba] font-medium	text-base	cursor-not-allowed tracking-wider	rounded-full">
              Ouverture des inscriptions le 17/10/2022
            </button>
          </div>
        </div>
        <Container>
          <Text>
            Envie de vivre le <strong>SNU</strong> ? Les inscriptions ouvrent très prochainement et vous pouvez déjà laisser votre adresse mail et votre date de naissance pour être
            averti(e) dès l’ouverture des inscriptions.
          </Text>
          <input
            type="email"
            onInput={(e) => {
              setMail(e.target.value);
            }}
            placeholder="Votre e-mail"
            value={mail}
          />
          <input
            type="text"
            onInput={(e) => {
              setBirthdateAt(e.target.value);
            }}
            placeholder="Votre date de naissance"
            value={birthdateAt}
            onFocus={(e) => (e.target.placeholder = "jj/mm/aaaa")}
            onBlur={(e) => (e.target.placeholder = "Votre date de naissance")}
          />
          <ModalButton color="#5245cc" onClick={handleClick} style={{ margin: "1rem 0", minWidth: "300px", maxWidth: "300px" }}>
            Être alerté
          </ModalButton>
        </Container>
      </Wrapper>
    </div>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  padding-top: 2rem;
  padding-left: auto;
  padding-right: auto;
  border-radius: 1rem;
  overflow: hidden;
  width: 60%;
  margin: auto;
  margin-top: -2rem;
  input {
    margin-bottom: 1rem;
    text-align: center;
    border: 1px solid #c7c7c7;
    background-color: #fff;
    border-radius: 10px;
    padding: 7px 30px;
    min-width: 300px;
    max-width: 300px;
  }
  @media (max-width: 767px) {
    margin-top: 0;
    width: 100%;
  }
`;

const Text = styled.div`
  color: #32267f;
  font-size: 1.2rem;
  padding: 1rem;
  @media (max-width: 767px) {
    font-size: 1rem;
  }
`;

const TitleContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
`;

const CardPhase = ({ upText, title, downText, to }) => {
  return (
    <a
      className="flex w-full flex-col justify-between items-start border-b-8 border-red-700 rounded-2xl  min-h-[10rem]	 bg-white pt-4	pr-4 pb-8	 pl-4	hover:text-black"
      href={urlWithScheme(to)}
      target="_blank"
      rel="noreferrer">
      <div>
        <p className="text-left text-[#ef4036]	uppercase text-[0.8rem]	">{upText}</p>
        <p className="text-lg text-left font-bold md:text-2xl ">{title}</p>
      </div>
      <p className="text-left text-base	md:text-sm text-[#6e757c] ">{downText}</p>
    </a>
  );
};

const Wrapper = styled.div`
  width: 100%;
  text-align: center;
  align-items: center;
  ::before {
    content: "";
    display: block;
    height: 630px;
    width: 100%;
    background: url(${require("../../../assets/phase3.jpg")}) center no-repeat;
    background-size: cover;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
  }
  ::after {
    content: "";
    display: block;
    height: 630px;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: rgb(66, 56, 157);
    background: linear-gradient(0deg, rgba(66, 56, 157, 1) 0%, rgba(66, 56, 157, 0.8575805322128851) 24%, rgba(66, 56, 157, 0.5606617647058824) 79%, rgba(0, 212, 255, 0) 100%);
    z-index: 1;
  }
  > * {
    position: relative;
  }
  .mobileOnly {
    display: none;
  }
  @media (max-width: 767px) {
    .mobileOnly {
      display: block;
    }
    padding: 0;
    ::before,
    ::after {
      height: 490px;
    }
  }
`;
const Title = styled.div`
  margin-bottom: 20px;
  color: #fff;
  font-size: 46px;
  font-weight: 600;
  @media (max-width: 1024px) {
    font-size: 38px;
  }
  @media (max-width: 767px) {
    font-size: 32px;
  }
  @media (max-width: 575px) {
    font-size: 22px;
  }
`;
const TopTitle = styled.div`
  text-transform: uppercase;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 400;
`;
