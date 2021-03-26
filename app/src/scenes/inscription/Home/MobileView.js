import React from "react";
import styled from "styled-components";

export default () => {
  return (
    <Points>
      <div className="points-title">Conditions d'inscription</div>
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
        <li style={{ padding: 0 }}>
          <FAQ href="https://www.snu.gouv.fr/foire-aux-questions-11" target="blank">
            <p>Toutes les réponses à vos questions</p> {">"}
          </FAQ>
        </li>
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
  );
};

const FAQ = styled.a`
  width: 100%;
  padding: 1rem;
  color: #fff;
  background-color: #32267f;
  display: flex;
  p {
    flex: 1;
    margin: 0;
  }
`;

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

const Points = styled.div`
  position: relative;
  max-width: 575px;
  margin: 40px auto;
  .points-title {
    text-transform: uppercase;
    display: inline-block;
    padding: 5px 20px;
    color: #ef4036;
    font-size: 0.8rem;
    font-weight: 400;
  }
  li {
    color: #32267f;
    font-size: 16px;
    padding: 25px 2rem;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    svg {
      height: 26px;
      width: 26px;
      margin-right: 10px;
    }
    div {
      width: 100%;
    }
    border-top: 1px solid #e5e7eb;
  }
  .button {
    text-transform: uppercase;
    color: #fff;
    background-color: #61c091;
    font-weight: 500;
    font-size: 1rem;
    cursor: pointer;
    padding: 22px 10px;
    margin: -2px;
    letter-spacing: 0.03em;
    border-radius: 30px;

    :hover {
      opacity: 0.9;
    }
  }
  display: none;
  @media (max-width: 767px) {
    display: block;
  }
`;
