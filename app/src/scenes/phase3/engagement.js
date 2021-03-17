import React from "react";
import { Col, Container, Row } from "reactstrap";
import styled from "styled-components";
import ProgramCard from "./components/programCard";

export default () => {
  return (
    <Container>
      <Heading>
        <h1>Les grands programmes d'engagement</h1>
        <p>Rejoignez plus 100 000 jeunes français déjà engagés dans de grandes causes</p>
      </Heading>
      <Row>
        <Col md={4}>
          <ProgramCard
            href="https://www.service-civique.gouv.fr/"
            title="Le Service Civique"
            image={require("../../assets/programmes-engagement/service-civique.jpg")}
            details="Une mission pour chacun au service de tous"
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://jeveuxaider.gouv.fr/"
            title="JeVeuxAider.gouv.fr par la Réserve Civique"
            image={require("../../assets/programmes-engagement/je-veux-aider.png")}
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://www.gendarmerie.interieur.gouv.fr/notre-institution/generalites/nos-effectifs/reserve-gendarmerie/devenir-reserviste"
            title="Réserve la Gendarmerie nationale"
            image={require("../../assets/programmes-engagement/reserve-gendarmerie.jpg")}
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://www.defense.gouv.fr/reserve/devenir-reserviste"
            title="Réserve des Armées"
            image={require("../../assets/programmes-engagement/reserve-armees.jpg")}
          />
        </Col>
        <Col md={4}>
          <ProgramCard href="" title="Réserve Civile Police Nationale" image={require("../../assets/programmes-engagement/reserve-police.jpg")} />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://www.education.gouv.fr/la-reserve-citoyenne-3020"
            title="Réserve Citoyenne de l'Education Nationale"
            image={require("../../assets/programmes-engagement/reserve-education.jpg")}
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://www.pompiers.fr/grand-public/devenir-sapeur-pompier/devenir-sapeur-pompier-volontaire-spv"
            title="Sapeurs Pompier volontaires"
            image={require("../../assets/programmes-engagement/sapeur-pompier-2.jpg")}
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://www.jeunes.gouv.fr/Chantiers-de-jeunes-benevoles"
            title="Chantier de jeune bénévoles"
            image={require("../../assets/programmes-engagement/jeune-benevole.jpg")}
          />
        </Col>
        <Col md={4}>
          <ProgramCard href="https://www.jeunes.gouv.fr/spip.php?article3676" title="BAFA" image={require("../../assets/programmes-engagement/bafa.jpg")} />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://sports.gouv.fr/emplois-metiers/diplomes-et-encadrement/"
            title="Brevet Fédéraux ou diplôme des fédérations sportives"
            image={require("../../assets/programmes-engagement/brevet-federaux.jpg")}
          />
        </Col>
        <Col md={4}>
          <ProgramCard href="https://www.jeunes.gouv.fr/-Benevolat-" title="Engagement bénévole" image={require("../../assets/programmes-engagement/benevole.jpg")} />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://www.moncompteformation.gouv.fr/espace-public/le-compte-engagement-citoyen-cec"
            title="Présentation du CEC"
            image={require("../../assets/programmes-engagement/cec.jpg")}
          />
        </Col>
        <Col md={4}>
          <ProgramCard href="" title="Juniors Association" image={require("../../assets/programmes-engagement/juniors-association.jpg")} />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://corpseuropeensolidarite.fr/"
            title="Le Corps européen de solidarité"
            image={require("../../assets/programmes-engagement/corps-europeen-solidarite.png")}
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://www.service-public.fr/particuliers/vosdroits/F11444"
            title="Le Volontariat de Solidarité Internationale"
            image={require("../../assets/programmes-engagement/volontariat-solidarite-internationale.jpg")}
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://www.france-volontaires.org/avant-le-volontariat/les-differents-volontariats/le-service-civique/"
            title="Le Service Civique à l'International"
            image={require("../../assets/programmes-engagement/service-civique-international.jpg")}
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://info.erasmusplus.fr/"
            title="Erasmus +, programme de l'Agence du Service Civique"
            image={require("../../assets/programmes-engagement/erasmus.jpg")}
          />
        </Col>
      </Row>
    </Container>
  );
};

const Heading = styled.div`
  margin-bottom: 40px;
  h1 {
    color: #161e2e;
    font-size: 46px;
    font-weight: 700;
  }
  p {
    color: #6b7280;
    font-size: 18px;
  }
`;
