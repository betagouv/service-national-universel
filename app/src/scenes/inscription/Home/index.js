import React, { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useHistory } from "react-router-dom";

import Header from "./header";
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from "react-responsive-carousel";
import MobileView from "./MobileView";
import DesktopView from "./DesktopView";
import ModalZip from "../../../components/modals/modalZip";
import ModalGoalReached from "../../../components/modals/modalGoalReached";
import ModalWaitingList from "../../../components/modals/modalWaitingList";
import api from "../../../services/api";
import { toastr } from "react-redux-toastr";
import { translate } from "../../../utils";

export default ({}) => {
  const [modal, setModal] = useState(null);
  const history = useHistory();
  const [zip, setZip] = useState();

  return (
    <div>
      {modal === "zip" && (
        <ModalZip
          onChange={() => setModal(false)}
          cb={(zip, e) => {
            setZip(zip);
            // if no goal specified for this department ...
            if (!e) return history.push("/inscription/profil");

            // ... else get the ratio and display the modal if needed
            const ratioRegistered = e.registered / e.max;
            const ratioWaitingList = e.waitingList / e.max;

            if (ratioRegistered >= 1 && ratioWaitingList >= 0.15) return setModal("ModalGoalReached");
            if (ratioRegistered >= 1) return setModal("ModalWaitingList");
            if (ratioRegistered < 1) return history.push("/inscription/profil");
          }}
        />
      )}
      {modal === "ModalGoalReached" && (
        <ModalGoalReached
          onChange={() => setModal(false)}
          cb={async (mail) => {
            const { ok, code } = await api.post("/waiting-list", { mail, zip });
            if (!ok) toastr.error("Oups, une erreur s'est produite", translate(code));
            else {
              toastr.success("Nous avons bien pris en compte votre intérêt");
            }
            setModal(false);
          }}
        />
      )}
      {modal === "ModalWaitingList" && <ModalWaitingList onChange={() => setModal(false)} cb={() => history.push("/inscription/profil")} />}
      <Helmet>
        <script>{`
            gtag('event', 'conversion', {
              'allow_custom_scripts': true,
              'send_to': 'DC-2971054/snuiz0/snu21lp+unique'
            });`}</script>
        <noscript>{`<img src="https://ad.doubleclick.net/ddm/activity/src=2971054;type=snuiz0;cat=snu21lp;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;npa=;gdpr=\${GDPR};gdpr_consent=\${GDPR_CONSENT_755};ord=1;num=1?" width="1" height="1" alt=""/>`}</noscript>
        <script>{`
            gtag('event', 'conversion', {
              'allow_custom_scripts': true,
              'send_to': 'DC-3452220/servi0/snu21lp+unique'
            });`}</script>
        <noscript>{`<img src="https://ad.doubleclick.net/ddm/activity/src=3452220;type=servi0;cat=snu21lp;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;npa=;gdpr=\${GDPR};gdpr_consent=\${GDPR_CONSENT_755};ord=1;num=1?" width="1" height="1" alt=""/>`}</noscript>
      </Helmet>
      <Header />
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
            <StartButton onClick={() => setModal("zip")}>Commencer&nbsp;l'inscription</StartButton>
          </StartButtonContainer>
        </CardsContainer>
        <MobileView />
        <DesktopView />
      </Wrapper>
      <StartButtonContainer className="mobile">
        <StartButton onClick={() => setModal("zip")}>Commencer&nbsp;l'inscription</StartButton>
      </StartButtonContainer>
    </div>
  );
};

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

const StartButton = styled(Link)`
  padding: 1rem 1.5rem;
  text-transform: uppercase;
  color: #fff;
  background-color: #61c091;
  font-weight: 500;
  font-size: 1rem;
  cursor: pointer;
  letter-spacing: 0.03em;
  border-radius: 30px;
  :hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    color: #fff;
  }
  &.mobile {
    border: 3px #51b081 solid;
  }
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
