import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { Spinner } from "reactstrap";
import { YOUNG_STATUS } from "snu-lib";

import api from "../../../services/api";
import { HERO_IMAGES_LIST, translate } from "../../../utils";
import { setYoung } from "../../../redux/auth/actions";
import { STEPS } from "../utils";
import InfoIcon from "../../../components/InfoIcon";
import BackIcon from "../../../components/BackIcon";
import ModalConfirm from "../../../components/modals/ModalConfirm";

export default function StepAvailability() {
  const young = useSelector((state) => state.Auth.young);
  const history = useHistory();
  const dispatch = useDispatch();
  const [indexAvailability, setIndexAvailability] = useState(0);
  const [availability, setAvailability] = useState();
  const [modal, setModal] = useState({ isOpen: false });

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

  useEffect(() => {
    (async () => {
      if (availability?.length === 0 && young.cohort === "2022") await api.put("/young", { status: YOUNG_STATUS.NOT_ELIGIBLE });
    })();
  }, [availability]);

  const submit = async (cohort) => {
    try {
      const { ok, code, data } = await api.put("/young", { cohort, inscriptionStep: STEPS.PARTICULIERES });
      if (!ok || !data?._id) return toastr.error("Une erreur s'est produite :", translate(code));
      dispatch(setYoung(data));
      history.push("/inscription/particulieres");
    } catch (e) {
      console.log(e);
      toastr.error("Erreur !");
    }
  };

  const resetCohort = async () => {
    try {
      const { ok, code, data } = await api.put("/young", { cohort: "2022" });
      if (!ok || !data?._id) return toastr.error("Une erreur s'est produite :", translate(code));
      dispatch(setYoung(data));
    } catch (e) {
      console.log(e);
      toastr.error("Erreur !");
    } finally {
      setModal({ isOpen: false, onConfirm: null });
    }
  };

  return (
    <>
      {!availability ? (
        <div style={{ padding: "1rem", width: "fit-content", marginInline: "auto" }}>
          <Spinner size="xl" style={{ width: "4rem", height: "4rem", color: "#362F78" }} />
        </div>
      ) : (
        <>
          <ModalConfirm
            isOpen={modal?.isOpen}
            title="Attention cette action est irréversible"
            message="Voulez-vous changer de séjour de cohésion"
            onCancel={() => setModal({ isOpen: false })}
            onConfirm={resetCohort}
          />
          <Container>
            {young.cohort !== "2022" && (
              <>
                <Info>
                  <h3>INSCRIPTION</h3>
                  <h1 style={{ marginBottom: "1rem" }}>Vous êtes inscrits au séjour {young.cohort}</h1>
                  <div className="btns">
                    <Button borderColor="#D1D5DB" onClick={() => setModal({ isOpen: true })}>
                      Changer de séjour
                    </Button>
                    <Button backgroundColor="#4f46e5" dark onClick={() => history.push("/inscription/particulieres")}>
                      Étape suivante
                    </Button>
                  </div>
                </Info>
                <div className="thumb" />
              </>
            )}
            {young.cohort === "2022" && availability?.length === 0 && (
              <>
                <Info>
                  <h3>INSCRIPTION NON-RECEVABLE</h3>
                  <h1 style={{ marginBottom: "1rem" }}>Malheureusement votre situation ne vous permet pas de participer à la session 2022 du SNU.</h1>
                  <Infos
                    href="https://support.snu.gouv.fr/help/fr-fr/24-questions-frequemment-posees/181-suis-je-eligible-a-un-sejour-de-cohesion-en-2022"
                    target="_blank"
                    rel="noreferrer">
                    <InfoIcon color="#32257F" />
                    <p>
                      <i>Pourquoi je ne vois aucun séjour ?</i> En savoir plus sur l&apos;éligibilité
                    </p>
                  </Infos>
                  <div className="btns">
                    <Button backgroundColor="#4f46e5" dark>
                      <a
                        style={{ fontSize: ".9rem", color: "#fff" }}
                        href="https://support.snu.gouv.fr/help/fr-fr/16-comprendre-le-snu/7-les-autres-formes-d-engagement"
                        target="_blank"
                        rel="noreferrer">
                        Consulter d&apos;autres dispositifs d&apos;engagement
                      </a>
                    </Button>
                  </div>
                </Info>
                <div className="thumb" />
              </>
            )}
            {young.cohort === "2022" && availability?.length > 0 && (
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
                  {availability[indexAvailability].info ? <AlerteInfo url={availability[indexAvailability].url}>{availability[indexAvailability].info}</AlerteInfo> : null}
                  <Infos
                    href="https://support.snu.gouv.fr/help/fr-fr/24-questions-frequemment-posees/181-suis-je-eligible-a-un-sejour-de-cohesion-en-2022"
                    target="_blank"
                    rel="noreferrer">
                    <InfoIcon color="#32257F" />
                    <p>
                      Veuillez vous assurer d&apos;être disponible sur l&apos;ensemble de la période.
                      {availability?.length < 3 ? (
                        <>
                          <br />
                          <i>Pourquoi je ne vois pas tous les séjours ?</i> En savoir plus sur l&apos;éligibilité
                        </>
                      ) : null}
                    </p>
                  </Infos>
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
        </>
      )}
    </>
  );
}

const AlerteInfo = ({ children, url }) => (
  <div style={{ display: "flex", color: "#32257f", backgroundColor: "#edecfc", padding: "1rem", borderRadius: "6px" }}>
    <InfoIcon color="#32257F" style={{ flex: "none" }} />
    {url ? (
      <a href={url} target="_blank" style={{ fontSize: ".9rem", marginLeft: "5px", color: "#32267f" }} rel="noreferrer">
        {children}
      </a>
    ) : (
      <div style={{ fontSize: ".9rem", marginLeft: "5px" }}>{children}</div>
    )}
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

  :hover {
    box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 12px 0px;
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

const Infos = styled.a`
  margin-top: 1rem;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: flex-start;
  background: rgba(79, 70, 229, 0.1);
  padding: 1rem;
  color: #32257f;
  border-radius: 6px;
  font-size: 0.9rem;
  svg {
    margin-top: 4px;
  }
  p {
    flex: 1;
    margin: 0;
  }
  :hover {
    color: #32257f;
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.16);
  }
`;
