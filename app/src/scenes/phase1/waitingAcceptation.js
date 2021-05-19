import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Row, Col } from "reactstrap";
import { setYoung } from "../../redux/auth/actions";

import { HeroContainer, Hero, Content, Alert, InterTitle, WhiteButton, VioletButton } from "../../components/Content";
import api from "../../services/api";
import { translate } from "../../utils";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [showAlert, setShowAlert] = useState(true);
  const dispatch = useDispatch();

  const [center, setCenter] = useState();

  useEffect(() => {
    (async () => {
      const { data, code, ok } = await api.get(`/cohesion-center/young/${young._id}`);
      if (!ok) toastr.error("error", code);
      setCenter(data);
    })();
  }, []);

  const handleDecline = async () => {
    try {
      if (!confirm("Êtes vous certain(e) de vouloir vous désister du séjour de cohésion ?")) return;
      console.log("Decline");
      const { data, ok, code } = await api.put("/young", { ...young, statusPhase1: "WITHDRAWN" });
      if (!ok) return toastr.error("Oups, une erreur est survenue", translate(code));
      toastr.success("Votre désistement a bien été pris en compte");
      if (data) dispatch(setYoung(data));

      //todo api call WITHDRAWN on Phase1 -> free 1 place -> take the next one on the waiting list
    } catch (error) {
      toastr.error("Oups, une erreur est survenue", translate(error?.code));
    }
  };
  const handleAccept = async () => {
    try {
      if (!confirm("Êtes vous certain(e) de vouloir valider votre participation au séjour de cohésion ?")) return;
      console.log("Accept");
      const { data, ok, code } = await api.put("/young", { ...young, statusPhase1: "AFFECTED" });
      if (!ok) return toastr.error("Oups, une erreur est survenue", translate(code));
      toastr.success("Votre participation a bien été pris en compte");
      if (data) dispatch(setYoung(data));
    } catch (error) {
      toastr.error("Oups, une erreur est survenue", translate(error?.code));
    }
  };

  if (!center) return <div />;

  return (
    <>
      <HeroContainer>
        <Hero>
          {showAlert && (
            <Alert>
              <div className="text">
                <strong>EN ATTENTE D'ACCEPTATION</strong>
              </div>
              <img src={require("../../assets/close.svg")} height={15} onClick={() => setShowAlert(false)} />
            </Alert>
          )}
          <Content showAlert={showAlert}>
            <h1>
              <strong>{young.firstName},</strong> vous avez été affecté à un centre !
            </h1>
            <p>
              Nous avons le plaisir de vous indiquer qu'une place vous est proposée pour participer au séjour de cohésion du Service National Universel du 21 juin au 2 juillet 2021
              !
            </p>
            <p>
              <strong>Votre lieu d'affectation</strong>
              <br />
              Vous avez été affecté(e) au centre de séjour de :
              <br />
              <span style={{ color: "#5145cd" }}>{`${center?.name}, ${center?.address} ${center?.zip} ${center?.city}, ${center?.department}, ${center?.region}`}</span>
            </p>
          </Content>
          <div className="thumb" />
        </Hero>
      </HeroContainer>
      <InterTitle>Confirmez votre inscription au SNU</InterTitle>
      <HeroContainer>
        <Row style={{ maxWidth: "80rem", margin: "0 auto" }}>
          <Col md={6}>
            <HeroContainer>
              <Hero>
                <Content style={{ width: "100%", textAlign: "center" }}>
                  <h2>Oui, je participe au séjour de cohésion et j'effectue les modalités de départ</h2>
                  <VioletButton style={{ margin: "1rem 0" }} onClick={handleAccept}>
                    Valider ma participation
                  </VioletButton>
                  <p style={{ fontSize: "1rem" }}>
                    <strong>LES PROCHAINES ÉTAPES</strong>
                    <br />
                    Vous avez jusqu'au 4 juin pour transmettre les documents requis pour votre participation :
                    <br />
                    <br />
                    <b>Le consentement relatif au droit à l'image</b>
                    <br />
                    <b>La fiche sanitaire</b>
                  </p>
                </Content>
              </Hero>
            </HeroContainer>
          </Col>
          <Col md={6}>
            <HeroContainer style={{ height: "100%" }}>
              <Hero style={{ height: "100%", jusifyContent: "center", alignItems: "center" }}>
                <Content style={{ width: "100%", textAlign: "center" }}>
                  <h2>Non, je laisse ma place à un autre volontaire</h2>
                  <WhiteButton onClick={handleDecline}>Décliner ma participation</WhiteButton>
                </Content>
              </Hero>
            </HeroContainer>
          </Col>
        </Row>
      </HeroContainer>
    </>
  );
};
