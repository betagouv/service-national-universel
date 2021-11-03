import React, { useState } from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";

import api from "../../../services/api";
import { HERO_IMAGES_LIST } from "../../../utils";
import { setYoung } from "../../../redux/auth/actions";
import { STEPS } from "../utils";
import InfoIcon from "../../../components/InfoIcon";
import BackIcon from "../../../components/BackIcon";
import { translate } from "../../../utils";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const dispatch = useDispatch();
  const [indexAvailability, setIndexAvailability] = useState(0);

  if (!young) {
    history.push("/inscription/profil");
    return <div />;
  }

  const availability = [
    {
      month: "Février",
      excludedGrade: ["1ere", "Terminale"],
      excludedZip: ["975", "974", "976", "984", "987", "986", "988"],
      includedBirthdate: { begin: "02/25/2004", end: "02/14/2007" },
      id: "Février 2022",
    },
    {
      month: "Juin",
      excludedGrade: ["1ere", "Terminale"],
      excludedZip: [],
      includedBirthdate: { begin: "06/24/2004", end: "06/13/2007" },
      id: "Juin 2022",
    },
    {
      month: "Juillet",
      excludedGrade: [],
      excludedZip: [],
      includedBirthdate: { begin: "07/15/2004", end: "07/04/2007" },
      id: "Juillet 2022",
    },
  ].filter((el) => {
    if (el.excludedGrade.includes(young.grade)) return false;
    else if (el.excludedZip.includes(young.zip)) return false;
    else if (
      new Date(el.includedBirthdate.begin).getTime() <= new Date(young.birthdateAt).getTime() &&
      new Date(young.birthdateAt).getTime() <= new Date(el.includedBirthdate.end).getTime()
    ) {
      return true;
    }
    return false;
  });

  const submit = async (cohort) => {
    try {
      const { ok, code, data: young } = await api.put("/young", { ...young, cohort, inscriptionStep: STEPS.DONE });
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      dispatch(setYoung(young));
      history.push("/inscription/done");
    } catch (e) {
      console.log(e);
      toastr.error("Erreur !");
    }
  };

  return (
    <>
      <Container>
        <Info>
          {availability[indexAvailability - 1] && (
            <div className="back" onClick={() => setIndexAvailability(indexAvailability - 1)}>
              <BackIcon color="#9CA3AF" style={{ marginRight: "7px" }} />
              <p>Session de {availability[indexAvailability - 1].month}</p>
            </div>
          )}
          <h3>Séjour de cohésion à venir</h3>
          <h1>Etes-vous disponible du 13 au 25 février 2022 ?</h1>
          <AlerteInfo>
            Vous bénéficierez d'une autorisation d'absence de votre établissement scolaire pour la semaine de cours à laquelle vous n'assistierez pas, si vous êtes scolarisé(e) en
            zone B ou C.
          </AlerteInfo>
          <div class="btns">
            <Button backgroundColor="#4f46e5" dark onClick={() => submit(availability[indexAvailability].id)}>
              Je suis disponible pour la session de {availability[indexAvailability].month}
            </Button>
            {availability[indexAvailability + 1] && (
              <Button onClick={() => setIndexAvailability(indexAvailability + 1)} borderColor="#D1D5DB">
                Non je ne suis pas disponible
              </Button>
            )}
          </div>
        </Info>
        <div className="thumb" />
      </Container>
    </>
  );
};

const AlerteInfo = ({ children }) => (
  <div style={{ display: "flex", color: "#32257f", backgroundColor: "#edecfc", padding: "1rem", borderRadius: "6px" }}>
    <InfoIcon color="#32257F" style={{ flex: "none" }} />
    <div style={{ fontSize: ".9rem", marginLeft: "5px" }}>{children}</div>
  </div>
);

const Info = styled.div`
  flex: 1.5;
  padding: 5rem;
  @media (max-width: 768px) {
    padding: 1.5rem;
  }

  h1 {
    color: #111827;
    font-size: 2rem;
    margin-block: 0.5rem 2.5rem;
  }

  h3 {
    text-transform: uppercase;
    color: #4f46e5;
    letter-spacing: 0.05em;
    font-size: 16px;
  }

  p {
    margin: 0;
  }

  .btns {
    display: flex;
    justify-content: center;
    align-items: center;
    @media (max-width: 768px) {
      flex-direction: column;
    }
  }

  .back {
    display: flex;
    align-items: center;
    color: #6b7280;
    margin-bottom: 2rem;
    cursor: pointer;
    width: fit-content;
  }
`;

const Button = styled.div`
  margin: 3rem 1rem 1rem 0rem;
  padding: 0.5rem 1rem;
  background-color: ${({ backgroundColor }) => backgroundColor || ""};
  border: 1px solid ${({ borderColor }) => borderColor || ""};
  color: ${({ dark }) => (dark ? "#fff" : "#374151")};
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  width: fit-content;
  cursor: pointer;
  text-align: center;

  &:last-child {
    margin-right: 0rem;
  }

  @media (max-width: 768px) {
    margin: 1rem 0rem 0rem 0rem;
  }
`;

const Container = styled.div`
  display: flex;

  @media (min-width: 768px) {
    .thumb {
      min-height: 400px;
      ${({ thumbImage = HERO_IMAGES_LIST[Math.floor(Math.random() * HERO_IMAGES_LIST.length)] }) =>
        `background: url(${require(`../../../assets/${thumbImage}`)}) no-repeat center;`}
      background-size: cover;
      flex: 1;
      -webkit-clip-path: polygon(15% 0, 0 100%, 100% 100%, 100% 0);
      clip-path: polygon(15% 0, 0 100%, 100% 100%, 100% 0);
    }
  }
`;
