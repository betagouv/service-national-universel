import React from "react";
import styled from "styled-components";

export default () => {
  return (
    <Wrapper>
      <Points backgroundColor="#fff">
        <div className="points-title">Conditions d'inscription</div>
        <GridContainer className="first_container">
          <Section>
            <ul>
              <li className="section_year">
                <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" rx="10" fill="#32267F" fill-opacity=".06" /><path d="M8.644 13.843l-3.487-3.487a.536.536 0 010-.758l.759-.759c.21-.21.549-.21.758 0l2.349 2.349 5.03-5.03c.21-.21.55-.21.76 0l.758.758c.21.21.21.549 0 .758l-6.169 6.169c-.21.21-.549.21-.758 0z" fill="#32267F" /></svg>
                <p>
                  Je suis disponible sur l'un des séjours de cohésion 2022, à savoir :
                </p>
              </li>
              <li className="section_dates">
                <p>
                  <strong className="section_dates_bullet">•</strong> Du <strong>13 au 25 février 2022*</strong>
                </p>
              </li>
              <li className="section_dates">
                <p>
                  <strong className="section_dates_bullet">•</strong> Du <strong>12 au 24 juin 2022</strong>
                </p>
              </li>
              <li className="section_dates">
                <p>
                  <strong className="section_dates_bullet">•</strong> Du <strong>3 au 15 juillet 2022</strong>
                </p>
              </li>
              <li className="section_precision">
                <p>
                  *Si vous êtes scolarisé(e) en zone B ou C, vous bénéficierez d’une autorisation d’absence de votre établissement scolaire
                </p>
              </li>
            </ul>
          </Section>
          <Section>
            <div className="section_conditions">
              <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" rx="10" fill="#32267F" fill-opacity=".06" /><path d="M8.644 13.843l-3.487-3.487a.536.536 0 010-.758l.759-.759c.21-.21.549-.21.758 0l2.349 2.349 5.03-5.03c.21-.21.55-.21.76 0l.758.758c.21.21.21.549 0 .758l-6.169 6.169c-.21.21-.549.21-.758 0z" fill="#32267F" /></svg>
              <p>J’aurai <strong>15, 16 ou 17 ans</strong> au moment de mon séjour de cohésion</p>
            </div>
            <div className="section_conditions">
              <svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="20" height="20" rx="10" fill="#32267F" fill-opacity=".06" /><path d="M8.644 13.843l-3.487-3.487a.536.536 0 010-.758l.759-.759c.21-.21.549-.21.758 0l2.349 2.349 5.03-5.03c.21-.21.55-.21.76 0l.758.758c.21.21.21.549 0 .758l-6.169 6.169c-.21.21-.549.21-.758 0z" fill="#32267F" /></svg>
              <p>Je suis de <strong>nationalité française</strong></p>
            </div>
          </Section>
        </GridContainer>
        <GridContainer className="second_container">
          <Section className="third_section bottom_section">
            <svg width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="8" fill="#32257F" /><path d="M21 24h-1v-4h-1l2 4zm-1-8h.01H20zm9 4a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            <Infos>
              <p>Pour compléter l'inscription en quelques minutes, il vous faudra :</p>
              <p>
                • Une <b>pièce d'identité</b> (Carte Nationale d'Identité ou Passeport)
                <br />• L'accord de votre ou vos <b>représentants légaux</b>
              </p>
            </Infos>
          </Section>
          <Section className="bottom_section">
            <svg width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="40" height="40" rx="8" fill="#32257F" /><path d="M16.228 17c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M29 20a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
            <FAQ href="https://support.snu.gouv.fr/help/fr-fr/16-comprendre-le-snu" target="blank">
              <p><strong>Besoin d'aide ?</strong></p>
              <p>Toutes les réponses à vos questions</p>
            </FAQ>
          </Section>
        </GridContainer>
      </Points>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  display: flex;
  margin-top: -2rem;
  @media (max-width: 767px) {
    display: none;
  }
`;

const FAQ = styled.a`
  width: 100%;
  color: #32267f;
  p {
    margin: 0;
    text-align: left;
  }
  :hover {
    color: #32267f;
    opacity: 0.8;
  }
`;

const Infos = styled.div`
  color: #6a7181;
`;

const Points = styled.div`
  position: relative;
  flex: 1;
  background-color: ${({ backgroundColor }) => (backgroundColor ? backgroundColor : "transparent")};
  .points-title {
    margin-top: 1.5rem;
    text-transform: uppercase;
    display: inline-block;
    padding: 2rem 20px;
    color: #32257F;
    font-size: 0.9rem;
    font-weight: 700;
    letter-spacing: 1px;
  }
  li {
    color: #32267f;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
  }
  p {
      text-align: left;
      margin-bottom: 0;
    }
    svg {
      margin-right: 10px;
    }
  .second_container {
    box-shadow: inset 0 10px 14px rgba(0, 0, 0, 0.08);
    background: #F8F8F8;
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
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  .third_section {
    border-right: 0.5px solid #DFDFDF;
  }
  .bottom_section {
    display: flex;
    padding: 2rem 3rem;
    align-items: center;
    font-size: 0.8rem;
    svg {
      width: 50px;
    }
  }
`;

const Section = styled.div`
  ul {
    border-top: 0.5px solid #DFDFDF;
    border-right: 0.5px solid #DFDFDF;
  }
  .section_year {
    padding: 1rem 3rem;
    display: flex;
    align-items: center;
  }
  .section_dates {
    padding: 0.5rem 3.5rem;
    margin-left: 1.5rem;
    font-size: 0.9rem;
  }
  .section_dates_bullet {
    margin-right: 5px;
  }
  .section_conditions {
    border-top: 0.5px solid #DFDFDF;
    padding: 2rem 3rem;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    color: #32267f;
  }
  .section_precision {
    font-size: 0.7rem;
    padding: 0 4rem 1rem 4rem;
    margin-left: 2rem;
  }
`;
