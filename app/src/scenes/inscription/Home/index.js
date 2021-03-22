import React, { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet";
import Header from "./header";

export default ({}) => {
  return (
    <div>
      <Helmet>
        <script>{`
            gtag('event', 'conversion', {
              'allow_custom_scripts': true,
              'send_to': 'DC-2971054/snuiz0/snu21lp+unique'
            });`}</script>
        <noscript>{`<img src="https://ad.doubleclick.net/ddm/activity/src=2971054;type=snuiz0;cat=snu21lp;dc_lat=;dc_rdid=;tag_for_child_directed_treatment=;tfua=;npa=;gdpr=\${GDPR};gdpr_consent=\${GDPR_CONSENT_755};ord=1;num=1?" width="1" height="1" alt=""/>`}</noscript>
      </Helmet>
      <Header />
      <Wrapper>
        <ConnectBtn to="/auth">se connecter</ConnectBtn>
        <Title>
          <strong>Participez au SNU </strong> édition 2021
        </Title>
        <Topbar>
          <Element>
            <h4>Le séjour de cohésion</h4>
            <p>Du 21 juin au 2 juillet 2021</p>
          </Element>
          <Element>
            <h4>La mission d'intérêt général</h4>
            <p>84 heures dans l'année</p>
          </Element>
          <Element>
            <h4>L'engagement</h4>
            <p>Mission de 3 mois min. - Facultative</p>
          </Element>
        </Topbar>
        <Points>
          <div className="points-title">JE PEUX M'INSCRIRE SI</div>
          <ul>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="rgb(49,196,141)" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <div>
                Je suis né(e) entre le <strong> 2 juillet 2003</strong> et le <strong> 20 avril 2006</strong> *
              </div>
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="rgb(49,196,141)" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <div>
                Je suis de <strong> nationalité française</strong>
              </div>
            </li>
            <li>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="rgb(49,196,141)" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
              <div>
                Je suis disponible du <strong>21 juin</strong> au <strong>2 juillet 2021</strong>
              </div>
            </li>
            <Link to="/inscription/profil">
              <li className="button">Commencer l'inscription</li>
            </Link>
            <li>
              <Infos>
                Pour compléter l'inscription en quelques minutes, il vous faudra :
                <div>
                  • Une <b>pièce d'identité</b> (Carte Nationale d'Identité ou Passeport)
                  <br />• L'accord de votre ou vos <b>représentants légaux</b>
                </div>
              </Infos>
            </li>
            <li>
              <Infos>
                * Vous êtes scolarisé(e) en <b>classe de seconde</b> et né(e) après le 20 avril 2006 ?<br />
                Une procédure dérogatoire vous permet de vous inscrire !<br />
                <a href="https://apicivique.s3.eu-west-3.amazonaws.com/SNU+Dossier+Inscriptions+De%CC%81rogatoires+2021.pdf" target="_blank">
                  Voici le lien du formulaire à <b>imprimer et remplir</b>.
                </a>
                <br />
                Merci de renvoyer le formulaire rempli à <a href="mailto:contact@snu.gouv.fr">contact@snu.gouv.fr</a>
              </Infos>
            </li>
          </ul>
        </Points>
        <a style={{ fontSize: 12, color: "#000" }} href="https://www.snu.gouv.fr/foire-aux-questions-11" target="blank">
          TOUTES LES RÉPONSES À VOS QUESTIONS
        </a>
      </Wrapper>
    </div>
  );
};

const Infos = styled.div`
  font-size: 0.8rem;
  color: #6a7181;
  a {
    color: #42389d;
    :hover {
      text-decoration: underline;
    }
  }
`;

const Wrapper = styled.div`
  padding: 0 2rem 1rem;
  /* position: absolute;
  left: 0;
  top: 128px; */
  width: 100%;
  text-align: center;

  ::before {
    content: "";
    display: block;
    height: 60%;
    min-height: 500px;
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
    height: 60%;
    min-height: 500px;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    background: rgba(63, 54, 148, 0.9);
    z-index: 1;
  }
  > * {
    position: relative;
    z-index: 2;
  }
  @media (max-width: 767px) {
    padding: 0 1rem 1rem;
    ::before,
    ::after {
      height: 80%;
    }
  }
`;
const Title = styled.div`
  margin-bottom: 20px;
  margin-top: 20px;
  color: #fff;
  font-size: 46px;
  font-weight: 400;
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
const ConnectBtn = styled(Link)`
  text-transform: uppercase;
  color: #6b7280;
  padding: 8px 5px;
  font-size: 12px;
  border-radius: 0 0 8px 8px;
  text-align: center;
  background-color: #fff;
  width: 120px;
  margin-left: auto;
  display: block;
  :hover {
    color: rgb(55, 65, 81);
  }
`;

const Topbar = styled.ul`
  list-style: none;
  display: flex;
  justify-content: space-between;
  width: 100%;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  max-width: 1040px;
  margin: 0 auto 50px;
  border: 1px solid rgb(143 163 250);
  counter-reset: number;
  @media (max-width: 767px) {
    flex-direction: column;
  }
`;

const Element = styled.li`
  flex: 1;
  position: relative;
  color: #fff;
  text-align: left;
  padding: 20px 10px 20px 75px;
  counter-increment: number;
  h4 {
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 3px;
  }
  p {
    font-size: 13px;
    margin-bottom: 0;
    color: rgb(180, 198, 252);
    font-weight: 500;
  }

  ::before {
    content: "0" counter(number);
    display: block;
    color: #42389d;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: 20px;
    font-size: 15px;
    font-weight: 700;
    background-color: #fff;
    height: 40px;
    width: 40px;
    line-height: 34px;
    text-align: center;
    border-radius: 50%;
    border: 2px solid #e02424;
  }

  :not(:last-child)::after {
    content: "";
    display: block;
    height: 100%;
    width: 20px;
    background: url(${require("../../../assets/big-angle-blue.svg")}) center top no-repeat;
    background-size: cover;
    position: absolute;
    top: 0;
    right: 0;
  }
  @media (max-width: 767px) {
    padding-top: 15px;
    padding-bottom: 15px;
    :not(:last-child) {
      border-bottom: 1px solid #d2d6dc;
      ::after {
        display: none;
      }
    }
  }
`;

const Points = styled.div`
  position: relative;
  max-width: 575px;
  margin: 20px auto;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 20px 25px -5px, rgba(0, 0, 0, 0.04) 0px 10px 10px -5px;
  border: 2px solid #5145cd;
  .points-title {
    display: inline-block;
    background-color: #fff;
    padding: 5px 20px;
    border-radius: 30px;
    color: #333;
    font-size: 15px;
    font-weight: 700;
    transform: translateY(-50%);
    box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
  }
  li {
    color: rgb(37, 47, 63);
    font-size: 20px;
    padding: 30px 2rem;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    svg {
      height: 26px;
      margin-right: 10px;
    }
    :not(:last-child) {
      border-bottom: 1px solid #e5e7eb;
    }
  }
  .button {
    text-transform: uppercase;
    color: #fff;
    background-color: #5145cd;
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    padding: 22px 10px;
    margin: -2px;
    letter-spacing: 0.03em;
    :hover {
      opacity: 0.9;
    }
  }
  @media (max-width: 767px) {
    li {
      font-size: 16px;
      padding: 25px 2rem;
    }
  }
`;
