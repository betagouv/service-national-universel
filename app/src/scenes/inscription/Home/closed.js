import React, { useState } from "react";
import styled from "styled-components";
import validator from "validator";

import Header from "./header";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import api from "../../../services/api";
import { toastr } from "react-redux-toastr";
import { translate } from "../../../utils";
import ModalButton from "../../../components/buttons/ModalButton";

export default ({ location }) => {
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
        { timeOut: 3000 }
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
          <TopTitle className="mobileOnly">inscription 2021</TopTitle>
          <Title>Participez au SNU</Title>
          <PlayButton href="https://www.youtube.com/watch?v=rE-8fe9xPDo" target="_blank">
            <svg width="20" height="26" viewBox="0 0 20 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19.1346 11.0998L3.79966 0.640236C2.49183 -0.253291 0.722412 0.719077 0.722412 2.32217V23.2149C0.722412 24.8443 2.49183 25.7904 3.79966 24.8969L19.1346 14.4373C20.2886 13.6752 20.2886 11.8882 19.1346 11.0998Z"
                fill="#D33C4A"
              />
            </svg>
          </PlayButton>
        </TitleContainer>
        <CardsContainer>
          <CardTitle>Une aventure en trois phases</CardTitle>
          <div className="desktop">
            <CardPhase upText="phase 1" title="Le séjour de cohésion" downText="Du 21 juin au 2 juillet 2021" />
            <CardPhase upText="phase 2" title="La mission d'intérêt général" downText="84 heures à réaliser au cours de l'année suivant le séjour de cohésion" />
            <CardPhase upText="phase 3 - facultative" title="L'engagement" downText="Mission facultative de 3 mois minimum" />
          </div>
          <Carousel className="mobile" showThumbs={false} showStatus={false} showArrows={true}>
            <CardPhase upText="phase 1" title="Le séjour de cohésion" downText="Du 21 juin au 2 juillet 2021" />
            <CardPhase upText="phase 2" title="La mission d'intérêt général" downText="84 heures à réaliser au cours de l'année suivant le séjour de cohésion" />
            <CardPhase upText="phase 3 - facultative" title="L'engagement" downText="Mission facultative de 3 mois minimum" />
          </Carousel>
          <StartButtonContainer className="desktop">
            <StartButton>Inscriptions&nbsp;terminées</StartButton>
          </StartButtonContainer>
        </CardsContainer>
        <Container>
          <Text>
            Les inscriptions sont malheureusement closes pour l'<b>édition 2021</b>.<br /> Vous pouvez cependant nous laisser vos coordonnées pour être recontacté(e) par
            l’administration lors de la prochaine campagne d'inscription du SNU.
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
      <StartButtonContainer className="mobile">
        <StartButton>Inscriptions&nbsp;terminées</StartButton>
      </StartButtonContainer>
    </div>
  );
};

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

const CardTitle = styled.div`
  color: #fff;
  font-size: 1.5rem;
  margin-bottom: 2rem;
  font-weight: 500;
  @media (max-width: 767px) {
    font-size: 1rem;
  }
`;

const PlayButton = styled.a`
  background-color: #fff;
  height: 90px;
  width: 90px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  svg {
    height: 100%;
  }
  @media (max-width: 767px) {
    height: 50px;
    width: 50px;
  }
`;

const TitleContainer = styled.div`
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 10;
`;

const CardsContainer = styled.div`
  flex: 1;
  z-index: 2;
  .mobile {
    display: none;
  }
  .desktop {
    display: flex;
    align-items: center;
    > * {
      margin: 0 1rem;
    }
  }
  @media (max-width: 767px) {
    .desktop {
      display: none;
    }
    .mobile {
      display: flex;
      > * {
        margin: 0 1rem;
      }
    }
  }
`;

const CardPhase = ({ upText, title, downText, color }) => {
  return (
    <Card>
      <div>
        <CardUpText>{upText}</CardUpText>
        <CardText>{title}</CardText>
      </div>
      <CardDownText>{downText}</CardDownText>
    </Card>
  );
};

const Card = styled.div`
  padding: 1rem 1rem 2rem 1rem;
  display: flex;
  width: 100%;
  min-height: 170px;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  background-color: #fff;
  border-radius: 1rem;
  border-bottom: 7px solid #ef4036;
`;
const CardUpText = styled.div`
  text-align: left;
  color: #ef4036;
  text-transform: uppercase;
  font-size: 0.8rem;
`;

const CardText = styled.div`
  color: #000;
  font-size: 1.5rem;
  text-align: left;
  font-weight: 700;
  @media (max-width: 767px) {
    font-size: 1.2rem;
  }
`;

const CardDownText = styled.div`
  text-align: left;
  font-size: 1rem;
  @media (max-width: 767px) {
    font-size: 0.85rem;
  }
  color: #6e757c;
`;

const StartButtonContainer = styled.div`
  z-index: 100;
  &.mobile {
    display: none;
  }
  justify-content: center;
  margin-top: 1rem;
  @media (max-width: 767px) {
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translate(-50%, 0);
    &.mobile {
      display: inline-block;
    }
  }
`;

const StartButton = styled.div`
  padding: 1rem 1.5rem;
  text-transform: uppercase;
  color: #fff;
  background-color: #acaaba;
  font-weight: 500;
  font-size: 1rem;
  cursor: not-allowed;
  letter-spacing: 0.03em;
  border-radius: 30px;
`;

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
