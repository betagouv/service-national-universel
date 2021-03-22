import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";

import ProgramCard from "./components/programCard";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { useSelector } from "react-redux";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [programs, setPrograms] = useState();
  useEffect(() => {
    (async () => {
      const { data, ok, code } = await api.get("/program");
      if (!ok) return toastr.error("nope");
      setPrograms(data);
    })();
  }, []);
  if (!programs) return <Loader />;
  return (
    <Container>
      <Heading>
        <h1>Les grands programmes d'engagement</h1>
        <p>Rejoignez plus 100 000 jeunes français déjà engagés dans de grandes causes</p>
      </Heading>
      <Row>
        {programs
          .filter((p) => p.visibility === "NATIONAL" || p.region === young.region || p.department === young.department)
          .map((p, i) => (
            <Col key={i} md={4}>
              <ProgramCard href={p.url} title={p.name} image={p.imageFile ? p.imageFile : require(`../../assets/programmes-engagement/${p.imageString}`)} details={p.description} />
            </Col>
          ))}
        {/* 
        <Col md={4}>
          <ProgramCard
            href="https://www.service-civique.gouv.fr/"
            title="Le Service Civique"
            image={require("../../assets/programmes-engagement/service-civique.jpg")}
            details="Qu’est-ce que c’est ? Un engagement volontaire au service de l’intérêt général, en France ou à l’étranger, auprès d’organisations à but non lucratif ou publiques, dans 9 domaines d’actions jugés « prioritaires pour la Nation » : solidarité, santé, éducation pour tous, culture et loisirs, sport, environnement, mémoire et citoyenneté, développement international et action humanitaire, intervention d’urgence. Il permet de développer sa citoyenneté comme ses compétences professionnelles.
C’est pour ... les jeunes de 16 à 25 ans, jusqu’à 30 ans en situation de handicap, sans condition de diplôme.
Est-ce indemnisé ? Oui, à hauteur de 580 euros net par mois.
Quelle durée d’engagement ? 24 heures par semaine minimum, entre 6 et 12 mois."
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://jeveuxaider.gouv.fr/"
            title="JeVeuxAider.gouv.fr par la Réserve Civique"
            image={require("../../assets/programmes-engagement/je-veux-aider.png")}
            details="Qu’est-ce que c’est ? Un dispositif d’engagement civique accessible à tous, auprès d’organisations publiques ou associatives, dans dix domaines d’action : santé, éducation, protection de l’environnement, culture, sport, protection ... la liste complète est disponible ici.)
C’est pour ... tous les résidents du territoire français, âgés de plus de 16 ans.
Est-ce indemnisé ? Non.
Quelle durée d’engagement ? Les missions peuvent être courtes ou longues, ponctuelles ou récurrentes, en fonction des besoins des organisations et des envies des bénévoles."
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://www.gendarmerie.interieur.gouv.fr/notre-institution/generalites/nos-effectifs/reserve-gendarmerie/devenir-reserviste"
            title="Réserve la Gendarmerie nationale"
            image={require("../../assets/programmes-engagement/reserve-gendarmerie.jpg")}
            details="Qu’est-ce que c’est ?
C’est pour les français de 17 à 40 ans ayant une bonne aptitude physique et ayant effectué leur JDC
Est-ce indemnisé ? Oui, selon une grille fixe
Quelle durée d’engagement ? Jusqu'à 30 jours par an"
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://www.defense.gouv.fr/reserve/devenir-reserviste"
            title="Réserve des Armées"
            image={require("../../assets/programmes-engagement/reserve-armees.jpg")}
            details="Qu’est-ce que c’est ? Un engagement permettant de contribuer à la sécurité du pays en consacrant une partie de son temps à la défense de la France, notamment en participant à des missions de protection de la population.
C’est pour ... les français de plus de 17 ans ayant une bonne aptitude physique et effectué leur JDC
Est-ce indemnisé ? Oui, selon une grille fixe
Quelle durée d’engagement ? De 1 à 5 ans, à hauteur de quelques jours par an"
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href=""
            title="Réserve Civile Police Nationale"
            image={require("../../assets/programmes-engagement/reserve-police.jpg")}
            details="Qu’est-ce que c’est ? la réserve civile de la police nationale, ouverte aux jeunes de plus de 18 ans, qui leur permet d’apporter un soutien à l’activité opérationnelle et administrative de la police ou une expertise (interprètes, juristes, informaticiens…) ;
C’est pour ... 
Est-ce indemnisé ? 
Quelle durée d’engagement ?"
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://www.education.gouv.fr/la-reserve-citoyenne-3020"
            title="Réserve Citoyenne de l'Education Nationale"
            image={require("../../assets/programmes-engagement/reserve-education.jpg")}
            details="Qu’est-ce que c’est ?  C'est la possibilité de s‘engager bénévolement pour transmettre et faire vivre les valeurs de la République à l’École, aux côtés des enseignants, ou dans le cadre d’activités périscolaires
C’est pour ... les citoyens français de plus de 18 ans, dotés de compétences spécifiques.
Est-ce indemnisé ? Dans certains cas, oui.
Quelle durée d’engagement ? Elle est variable en fonction des situations."
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://www.pompiers.fr/grand-public/devenir-sapeur-pompier/devenir-sapeur-pompier-volontaire-spv"
            title="Sapeurs Pompier volontaires"
            image={require("../../assets/programmes-engagement/sapeur-pompier-2.jpg")}
            details="Qu’est-ce que c’est ? Un engagement en 4 cycles de formation sucessifs permettant de découvrir les matériels et les comportements qui sauvent, l’engagement citoyen et de mettre en œuvre procédure et matériels dans des contextes de plus en plus proches de la réalité opérationnelle 
C’est pour ... les citoyens français et résidents réguliers âgés de 16 à 60 ans
Est-ce indemnisé ? Oui
Quelle durée d’engagement ? De 1 à 3 ans, à raison de 30 heures de formations puis de 6 interventions par mois en moyenne"
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://www.jeunes.gouv.fr/Chantiers-de-jeunes-benevoles"
            title="Chantier de jeune bénévoles"
            image={require("../../assets/programmes-engagement/jeune-benevole.jpg")}
            details="Qu’est-ce que c’est ? Les chantiers de jeunes bénévoles vous proposent des expériences de bénévolat en France et à l’étranger et rassemblent des jeunes autour d’un projet utile à la collectivité 
C’est pour ... les jeunes à partir de 13 ans
Est-ce indemnisé ? Non
Quelle durée d’engagement ? De 2 à 3 semaines"
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://www.jeunes.gouv.fr/spip.php?article3676"
            title="BAFA"
            image={require("../../assets/programmes-engagement/bafa.jpg")}
            details="Qu’est-ce que c’est ? Le brevet d’aptitude aux fonctions d’animateur d’accueil collectif de mineurs (BAFA) permet d’encadrer à titre non professionnel, de façon occasionnelle, des enfants et des adolescents en accueils collectifs de mineurs (plus généralement appelés colo/centres de vacances et centres de loisirs). 
C’est pour ... les jeunes dès 17 ans
Est-ce indemnisé ? Non, mais ensuite vous pouvez encadrer des mineurs en étant indemnisé
Quelle durée d’engagement ? 28 jours minimum, en 3 temps : 8 jours de formation, 14 jours effectifs en stage de formation et 6 à 8 jours d'approndissement ensuite"
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://sports.gouv.fr/emplois-metiers/diplomes-et-encadrement/"
            title="Brevet Fédéraux ou diplôme des fédérations sportives"
            image={require("../../assets/programmes-engagement/brevet-federaux.jpg")}
            details=""
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://www.jeunes.gouv.fr/-Benevolat-"
            title="Engagement bénévole"
            image={require("../../assets/programmes-engagement/benevole.jpg")}
            details="Tout engagement associatif, ouvert à tous les citoyens, permettant de s’investir bénévolement en faveur de l’intérêt général au sein d’une association."
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://www.moncompteformation.gouv.fr/espace-public/le-compte-engagement-citoyen-cec"
            title="Présentation du CEC"
            image={require("../../assets/programmes-engagement/cec.jpg")}
            details=""
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://juniorassociation.org/index.php"
            title="Juniors Association"
            image={require("../../assets/programmes-engagement/juniors-association.jpg")}
            details="Qu’est-ce que c’est ? Junior Association est une démarche souple qui permet à tout groupe de jeunes de mettre en place des projets dans une dynamique associative
C’est pour ... les jeunes de 11 à 18 ans
Est-ce indemnisé ? Non
Quelle durée d’engagement ? Cela dépend de la Junior Association"
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://corpseuropeensolidarite.fr/"
            title="Le Corps européen de solidarité"
            image={require("../../assets/programmes-engagement/corps-europeen-solidarite.png")}
            details="Qu’est-ce que c’est ? Le corps européen de solidarité offre la possibilité de se porter volontaires dans des projets organisés en France ou à l’étranger et destinés à aider des communautés et des personnes dans toute l’Europe. 
C’est pour ... les jeunes de 18 à 30 ans
Est-ce indemnisé ? Non
Quelle durée d’engagement ? De 2 à 12 mois"
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://www.service-public.fr/particuliers/vosdroits/F11444"
            title="Le Volontariat de Solidarité Internationale"
            image={require("../../assets/programmes-engagement/volontariat-solidarite-internationale.jpg")}
            details="Qu’est-ce que c’est ? les différentes formes de volontariat à l’international, et notamment le volontariat de solidarité internationale ou le service civique à l’international ;

C’est pour ... les citoyens du monde de plus de 18 ans (sans condition de nationalité ni limite d'âge)
Est-ce indemnisé ? Oui, le montant dépend du pays de la mission et votre logement, vos frais de transport et nourriture sont pris en charge.
Quelle durée d’engagement ? Une mission dure entre 1 an et 2 ans."
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://www.france-volontaires.org/avant-le-volontariat/les-differents-volontariats/le-service-civique/"
            title="Le Service Civique à l'International"
            image={require("../../assets/programmes-engagement/service-civique-international.jpg")}
            details="Qu’est-ce que c’est ? Le VSI permet de s'engager auprès d'associations agréées ayant pour objet des actions de solidarité internationale (enseignement, développement urbain et rural, santé, actions d'urgence...).
C’est pour ... tous les jeunes entre 16 à 25 ans (jusqu'à 30 ans pour les jeunes en situation de handicap)
Est-ce indemnisé ? Oui, à hauteur de 522 euros net par mois.
Quelle durée d’engagement ? De 6 à 12 mois "
          />
        </Col>
        <Col md={4}>
          <ProgramCard
            href="https://info.erasmusplus.fr/"
            title="Erasmus +, programme de l'Agence du Service Civique"
            image={require("../../assets/programmes-engagement/erasmus.jpg")}
            details="Qu’est-ce que c’est ? Le programme vise à donner aux étudiants, aux stagiaires, au personnel et d'une manière générale aux jeunes de moins de 30 ans avec ou sans diplôme, la possibilité de séjourner à l’étranger pour renforcer leurs compétences et accroître leur employabilité.
C’est pour ... les jeunes de 16 à 25 ans (jusqu'à 30 ans pour les jeunes en situation de handicap)
Est-ce indemnisé ? Ou i
Quelle durée d’engagement ? De 6 à 12 mois"
          />
        </Col>
       */}
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
