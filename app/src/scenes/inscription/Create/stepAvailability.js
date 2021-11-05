import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Spinner } from "reactstrap";

import api from "../../../services/api";
import { HERO_IMAGES_LIST } from "../../../utils";
import { setYoung } from "../../../redux/auth/actions";
import { STEPS } from "../utils";
import InfoIcon from "../../../components/InfoIcon";
import BackIcon from "../../../components/BackIcon";
import { translate, YOUNG_STATUS } from "../../../utils";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const dispatch = useDispatch();
  const [indexAvailability, setIndexAvailability] = useState(0);
  const [availability, setAvailability] = useState();

  if (!young) {
    history.push("/inscription/profil");
    return <div />;
  }

  useEffect(() => {
    (async () => {
      const { ok, code, data } = await api.get(`/cohort-session/availability/2022`);
      setAvailability([]);
      if (!ok) {
        toastr.error("Oups, une erreur est survenue", code);
      } else {
        setAvailability(data);
      }
    })();
  }, []);

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
      {!availability ? (
        <div style={{ padding: "1rem", width: "fit-content", marginInline: "auto" }}>
          <Spinner size="xl" style={{ width: "4rem", height: "4rem", color: "#362F78" }} />
        </div>
      ) : (
        <Container>
          {availability?.length === 0 ? (
            <>
              <Info>
                <h3>INSCRIPTION NON-RECEVABLE</h3>
                <h1>Malheureusement votre situation ne vous permet pas de participer à la session 2022 du SNU.</h1>
                <div className="btns">
                  <Button onClick={() => history.push("/les-programmes")} borderColor="#D1D5DB">
                    Consulter d'autres dispositifs d'engagement
                  </Button>
                </div>
              </Info>
              <div className="thumb" />
            </>
          ) : (
            <>
              <Info>
                {availability[indexAvailability - 1] && (
                  <div className="back" onClick={() => setIndexAvailability(indexAvailability - 1)}>
                    <BackIcon color="#9CA3AF" style={{ marginRight: "7px" }} />
                    <p>Session de {availability[indexAvailability - 1].month}</p>
                  </div>
                )}
                <h3>Séjour de cohésion à venir</h3>
                <h1>Etes-vous disponible du {availability[indexAvailability].stringDate} ?</h1>
                <AlerteInfo>{availability[indexAvailability].info}</AlerteInfo>
                <div className="btns">
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
            </>
          )}
        </Container>
      )}
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
