import React, { useState, useEffect } from "react";
import { Col, Row } from "reactstrap";
import { toastr } from "react-redux-toastr";
import { useSelector, useDispatch } from "react-redux";

import { setYoung } from "../../redux/auth/actions";
import { HeroContainer, Hero, Content, VioletButton } from "../../components/Content";
import api from "../../services/api";
import { translate } from "../../utils";
import MeetingPointCard from "./components/MeetingPointCard";
import MeetingPointCardNotFound from "./components/MeetingPointCardNotFound";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const [meetingPoints, setMeetingPoints] = useState();
  const [meetingPointId, setMeetingPointId] = useState();
  const [meetingPointNotFoundSelected, setMeetingPointNotFoundSelected] = useState(false);

  const renderMeetingPoint = () => {
    // if young have chosen a meetingPoint, display it
    if (young.meetingPointId) {
      return (
        <Content style={{ width: "100%" }}>
          <div>
            <h2>Mon point de rassemblement</h2>
            <p>Voici votre point de rassemblement. Prévoyez d’être bien à l’heure !</p>
          </div>
          <Row style={{ justifyContent: "center" }}>
            <Col md={6}>
              <MeetingPointCard meetingPointId={young.meetingPointId} selected={true} />
            </Col>
          </Row>
        </Content>
      );
    }

    // if the young have chosen "par mes propres moyens", display it
    if (young.deplacementPhase1Autonomous === "true") {
      return (
        <Content style={{ width: "100%" }}>
          <div>
            <h2>Mon point de rassemblement</h2>
            <p>Voici votre point de rassemblement. Prévoyez d’être bien à l’heure !</p>
          </div>
          <Row style={{ justifyContent: "center" }}>
            <Col md={6}>
              <MeetingPointCardNotFound selected={true} />
            </Col>
          </Row>
        </Content>
      );
    }

    return (
      <Content style={{ width: "100%" }}>
        <div>
          <h2>Confirmez votre point de rassemblement</h2>
          <p>
            Merci de confirmer votre point de rassemblement <b>sous 48 heures.</b>
          </p>
        </div>
        <Row style={{ justifyContent: "center" }}>
          {meetingPoints?.length ? (
            meetingPoints?.map((mp, i) => (
              <Col md={6} key={i}>
                <MeetingPointCard meetingPoint={mp} onClick={() => handleClickMeetingPoint(mp._id)} selected={meetingPointId === mp._id} />
              </Col>
            ))
          ) : (
            <Col md={6}>
              <MeetingPointCardNotFound onClick={handleClickMeetingPointNotFound} selected={meetingPointNotFoundSelected} />
            </Col>
          )}
        </Row>
        <div style={{ width: "100%", textAlign: "center" }}>
          <VioletButton disabled={!meetingPointId && !meetingPointNotFoundSelected} onClick={submitMeetingPoint}>
            J’ai pris connaissance de mon point de rassemblement
          </VioletButton>
        </div>
      </Content>
    );
  };

  const handleClickMeetingPoint = (id) => {
    setMeetingPointId(id);
  };

  const handleClickMeetingPointNotFound = () => {
    setMeetingPointNotFoundSelected(!meetingPointNotFoundSelected);
  };

  const submitMeetingPoint = async () => {
    try {
      if (!confirm("Êtes vous certain(e) de vouloir valider ce point de rassemblement ?")) return;
      const { data, ok, code } = await api.put(`/young/${young._id}/meeting-point`, {
        meetingPointId,
        deplacementPhase1Autonomous: meetingPointNotFoundSelected ? "true" : "false",
      });
      if (!ok) return toastr.error("Oups, une erreur est survenue", translate(code));
      toastr.success("Votre choix a bien été pris en compte");
      if (data) dispatch(setYoung(data));
    } catch (error) {
      if (error.code === "OPERATION_NOT_ALLOWED")
        return toastr.error("Oups, une erreur est survenue. Il semblerait que ce bus soit déjà complet", translate(error?.code), {
          timeOut: 5000,
        });
      toastr.error("Oups, une erreur est survenue", translate(error?.code));
    }
  };

  useEffect(() => {
    (async () => {
      const { data, code, ok } = await api.get(`/meeting-point`);
      if (!ok) return toastr.error("error", translate(code));
      setMeetingPoints(data.filter((mp) => mp.bus?.placesLeft >= 0));
    })();
  }, []);

  return (
    <HeroContainer>
      <Hero>{renderMeetingPoint()}</Hero>
    </HeroContainer>
  );
};
