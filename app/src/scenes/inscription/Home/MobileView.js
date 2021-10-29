import React from "react";
import styled from "styled-components";

export default () => {
  return (
    <Points>
      <div className="points-title">Conditions d'inscription</div>
      <ul>
        <li>
          <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" rx="10" fill="#32267F" fill-opacity=".06" /><path d="M8.644 13.843l-3.487-3.487a.536.536 0 010-.758l.759-.759c.21-.21.549-.21.758 0l2.349 2.349 5.03-5.03c.21-.21.55-.21.76 0l.758.758c.21.21.21.549 0 .758l-6.169 6.169c-.21.21-.549.21-.758 0z" fill="#32267F" /></svg>
          <div>
            <p>Je suis disponible sur l'un des séjours de cohésion 2022, à savoir :</p>
            <p>
              <strong>•</strong> Du <strong>13 au 25 février 2022*</strong>
            </p>
            <p>
              <strong>•</strong> Du <strong>12 au 24 juin 2022</strong>
            </p>
            <p>
              <strong>•</strong> Du <strong>3 au 15 juillet 2022</strong>
            </p>
            <p className="note">
              *Si vous êtes scolarisé(e) en zone B ou C, vous bénéficierez d’une autorisation d’absence de votre établissement scolaire
            </p>
          </div>
        </li>
        <li>
          <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" rx="10" fill="#32267F" fill-opacity=".06" /><path d="M8.644 13.843l-3.487-3.487a.536.536 0 010-.758l.759-.759c.21-.21.549-.21.758 0l2.349 2.349 5.03-5.03c.21-.21.55-.21.76 0l.758.758c.21.21.21.549 0 .758l-6.169 6.169c-.21.21-.549.21-.758 0z" fill="#32267F" /></svg>
          <div>
            Je suis de <strong> nationalité française</strong>
          </div>
        </li>
        <li>
          <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" rx="10" fill="#32267F" fill-opacity=".06" /><path d="M8.644 13.843l-3.487-3.487a.536.536 0 010-.758l.759-.759c.21-.21.549-.21.758 0l2.349 2.349 5.03-5.03c.21-.21.55-.21.76 0l.758.758c.21.21.21.549 0 .758l-6.169 6.169c-.21.21-.549.21-.758 0z" fill="#32267F" /></svg>
          <div>
            J’aurai <strong>15, 16 ou 17 ans</strong> au moment de mon séjour de cohésion
          </div>
        </li>
        <li style={{ padding: 0 }}>
          <FAQ href="https://support.snu.gouv.fr/help/fr-fr/16-comprendre-le-snu" target="blank">
            <p>Toutes les réponses à vos questions</p>
            <svg width="6" height="10" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M.293 9.707a1 1 0 010-1.414L3.586 5 .293 1.707A1 1 0 011.707.293l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" fill="#fff" /></svg>
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
  align-items: center;
  svg {
    height: 10px
  }
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
    color: #32257F;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 1px;
  }
  .note {
    font-size: 0.8rem;
  }
  li {
    color: #32267f;
    font-size: 16px;
    padding: 25px 2rem;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    svg {
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
