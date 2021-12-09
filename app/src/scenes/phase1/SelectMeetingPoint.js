import React, { useState, useEffect } from "react";
import { Col, Row } from "reactstrap";
import { toastr } from "react-redux-toastr";
import { useSelector, useDispatch } from "react-redux";

import { setYoung } from "../../redux/auth/actions";
import { HeroContainer, Hero, Content, VioletButton } from "../../components/Content";
import ModalConfirm from "../../components/modals/ModalConfirm";
import api from "../../services/api";
import { translate, ENABLE_CHOOSE_MEETING_POINT } from "../../utils";
import MeetingPointCard from "./components/MeetingPointCard";
import MeetingPointCardNotFound from "./components/MeetingPointCardNotFound";

export default function SelectMeetingPoint() {
  const young = useSelector((state) => state.Auth.young);
  const dispatch = useDispatch();
  const [meetingPoints, setMeetingPoints] = useState();
  const [meetingPointId, setMeetingPointId] = useState();
  const [meetingPointNotFoundSelected, setMeetingPointNotFoundSelected] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

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
            Il n&apos;est plus possible de confirmer votre point de rassemblement. Si vous aviez plusieurs propositions, un point de rassemblement va vous être assigné
            d&apos;office parmi les choix ci-dessous.
          </p>
        </div>
        <Row style={{ justifyContent: "center" }}>
          {meetingPoints?.length ? (
            meetingPoints?.map((mp, i) => (
              <Col md={6} key={i}>
                <MeetingPointCard meetingPoint={mp} onClick={() => handleClickMeetingPoint(mp._id)} selected={ENABLE_CHOOSE_MEETING_POINT && meetingPointId === mp._id} />
              </Col>
            ))
          ) : (
            <Col md={6}>
              <MeetingPointCardNotFound onClick={handleClickMeetingPointNotFound} selected={ENABLE_CHOOSE_MEETING_POINT && meetingPointNotFoundSelected} />
            </Col>
          )}
        </Row>
        {ENABLE_CHOOSE_MEETING_POINT ? (
          <div style={{ width: "100%", textAlign: "center" }}>
            <VioletButton disabled={!meetingPointId && !meetingPointNotFoundSelected} onClick={() => setModal({ isOpen: true, onConfirm: submitMeetingPoint })}>
              J’ai pris connaissance de mon point de rassemblement
            </VioletButton>
          </div>
        ) : null}
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
      setMeetingPoints(data.filter((mp) => mp.bus?.placesLeft > 0));
    })();
  }, []);

  return (
    <HeroContainer>
      <Hero>{renderMeetingPoint()}</Hero>
      <ModalConfirm
        isOpen={modal?.isOpen}
        title="Validation de point de rassemblement"
        message="Êtes vous certain(e) de vouloir valider ce point de rassemblement ?"
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </HeroContainer>
  );
}
