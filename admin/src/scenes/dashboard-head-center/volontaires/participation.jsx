import React from "react";
import { Col, Row } from "reactstrap";
import { Subtitle, CardComponentPercentage } from "../../../components/dashboard";
import { colors } from "../../../utils";

export default function Participation({ cohesionStayPresence, youngPhase1Agreement, getLink, total, presenceJDM, departInform, departSejourMotif, sessionPhase1Id, centerId }) {
  return (
    <React.Fragment>
      <Subtitle>Participations au séjour de cohésion</Subtitle>
      <Row>
        <Col md={6} xl={3} k="cohesionStayPresence_true">
          <CardComponentPercentage
            getLink={getLink}
            to={`/centre/${centerId}/${sessionPhase1Id}/general?COHESION_PRESENCE=%5B"true"%5D`}
            color={colors.green}
            title="Présent à l'arrivée"
            value={cohesionStayPresence["true"]}
            total={total}
          />
        </Col>
        <Col md={6} xl={3} k="cohesionStayPresence_false">
          <CardComponentPercentage
            getLink={getLink}
            to={`/centre/${centerId}/${sessionPhase1Id}/general?COHESION_PRESENCE=%5B"false"%5D`}
            color={colors.yellow}
            title="Absent à l'arrivée"
            value={cohesionStayPresence["false"]}
            total={total}
          />
        </Col>
        <Col md={6} xl={3} k="cohesionStayPresence_unknown">
          <CardComponentPercentage disabled color={colors.grey} title="Non renseigné" value={total - cohesionStayPresence["false"] - cohesionStayPresence["true"]} total={total} />
        </Col>
      </Row>
      <Row>
        <Col md={6} xl={3} k="presenceJDM_true">
          <CardComponentPercentage
            getLink={getLink}
            to={`/centre/${centerId}/${sessionPhase1Id}/general?COHESION_JDM=%5B"true"%5D`}
            color={colors.green}
            title="Présent à la JDM"
            value={presenceJDM["true"]}
            total={total}
          />
        </Col>
        <Col md={6} xl={3} k="presenceJDM_false">
          <CardComponentPercentage
            getLink={getLink}
            to={`/centre/${centerId}/${sessionPhase1Id}/general?COHESION_JDM=%5B"false"%5D`}
            color={colors.yellow}
            title="Absent à la JDM"
            value={presenceJDM["false"]}
            total={total}
          />
        </Col>
        <Col md={6} xl={3} k="presenceJDM_NR">
          <CardComponentPercentage disabled color={colors.grey} title="Non renseigné" value={total - presenceJDM["false"] - presenceJDM["true"]} total={total} />
        </Col>
      </Row>
      <Row>
        <Col md={6} xl={3} k="departInform_true">
          <CardComponentPercentage
            getLink={getLink}
            to={`/centre/${centerId}/${sessionPhase1Id}/general?DEPART=%5B"true"%5D`}
            color={colors.green}
            title="Départs renseignés"
            value={departInform["true"]}
            total={total}
          />
        </Col>
        <Col md={6} xl={3} k="departInform_exclusion">
          <CardComponentPercentage
            getLink={getLink}
            to={`/centre/${centerId}/${sessionPhase1Id}/general?DEPART_MOTIF=%5B"Exclusion"%5D`}
            color={colors.red}
            title="Exclusion"
            value={departSejourMotif["Exclusion"]}
            total={total}
          />
        </Col>

        {/* ["Exclusion", "Cas de force majeure pour le volontaire", "Annulation du séjour ou mesure d’éviction sanitaire", "Autre"] */}
        <Col md={6} xl={3} k="departInform_force">
          <CardComponentPercentage
            getLink={getLink}
            to={`/centre/${centerId}/${sessionPhase1Id}/general?DEPART_MOTIF=%5B"Cas de force majeure pour le volontaire"%5D`}
            color={colors.yellow}
            title="Cas de force majeure"
            value={departSejourMotif["Cas de force majeure pour le volontaire"]}
            total={total}
          />
        </Col>
        <Col md={6} xl={3} k="departInform_cancel">
          <CardComponentPercentage
            getLink={getLink}
            to={`/centre/${centerId}/${sessionPhase1Id}/general?DEPART_MOTIF=%5B"Annulation du séjour ou mesure d’éviction sanitaire"%5D`}
            color={colors.lightOrange}
            title="Annulation séjour/ éviction sanitaire"
            value={departSejourMotif["Annulation du séjour ou mesure d’éviction sanitaire"]}
            total={total}
          />
        </Col>
      </Row>
      <Subtitle>Confirmation de participation au séjour de cohésion</Subtitle>
      <Row>
        <Col md={6} xl={3} k="cohesionStayPresence_true">
          <CardComponentPercentage
            getLink={getLink}
            to={`/centre/${centerId}/${sessionPhase1Id}/general?COHESION_PARTICIPATION=%5B"true"%5D`}
            color={colors.green}
            title="Participation confirmée"
            value={youngPhase1Agreement["true"]}
            total={total}
          />
        </Col>
        <Col md={6} xl={3} k="cohesionStayPresence_false">
          <CardComponentPercentage
            getLink={getLink}
            to={`/centre/${centerId}/${sessionPhase1Id}/general?COHESION_PARTICIPATION=%5B"false"%2C"Non+renseigné"%5D`}
            color={colors.yellow}
            title="Participation non renseignée"
            value={total - youngPhase1Agreement["true"]}
            total={total}
          />
        </Col>
      </Row>
    </React.Fragment>
  );
}
