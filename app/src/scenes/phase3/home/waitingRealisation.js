import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { ReactiveBase, ReactiveList } from "@appbaseio/reactivesearch";

import ProgramCard from "../components/programCard";
import MissionCard from "../components/missionCard";
import api from "../../../services/api";
import { apiURL } from "../../../config";
import { HeroContainer, Hero } from "../../../components/Content";

export default () => {
  const young = useSelector((state) => state.Auth.young) || {};
  const [programs, setPrograms] = useState([]);

  useEffect(() => {
    (async () => {
      const { data, ok, code } = await api.get("/program");
      if (!ok) return toastr.error("nope");
      setPrograms(data);
    })();
  }, []);

  return (
    <HeroContainer>
      <Hero>
        <div className="content">
          <h1>
            <strong>{young.firstName},</strong> poursuivez votre engagement ! <span>Facultatif</span>
          </h1>
          <p>
            A l’issue de la mission d’intérêt général, chaque volontaire peut poursuivre son engagement et sa participation à la création d’une société fraternelle, notamment en
            réalisant la phase 3 du SNU. Cet engagement volontaire s’adresse aux jeunes de 16 ans à 25 ans, et dure de 3 mois à 1 an.
          </p>
        </div>
        <div className="thumb" />
      </Hero>
      <TransparentHero>
        <Heading>
          <h2>Parmi les possibilités d'engagement</h2>
          <p>Rejoignez plus de 100 000 jeunes français déjà engagés dans de grandes causes</p>
        </Heading>
        <Row>
          {programs.slice(0, 3).map((p, i) => (
            <Col key={i}>
              <ProgramCard program={p} image={p.imageFile ? p.imageFile : require(`../../../assets/programmes-engagement/${p.imageString}`)} />
            </Col>
          ))}
        </Row>
        <SeeMore to="/phase3/les-programmes">Tous les programmes d'engagement →</SeeMore>
        <hr style={{ margin: "40px 0", opacity: 0.8 }} />
      </TransparentHero>
      <TransparentHero>
        <Heading>
          <h2>Trouvez une mission de bénévolat à distance ou près de chez vous</h2>
          <p>Plus de 30 000 missions disponibles pour poursuivre votre engagement</p>
        </Heading>
        <Missions>
          <ReactiveBase url={`${apiURL}/es`} app="missionapi" headers={{ Authorization: `JWT ${api.getToken()}` }}>
            <ReactiveList
              componentId="result"
              pagination={true}
              size={3}
              showLoader={true}
              loader="Chargement..."
              innerClass={{ pagination: "pagination" }}
              dataField="created_at"
              renderResultStats={() => <div />}
              render={({ data }) => {
                return data.map((e, i) => <MissionCard mission={e} key={i} image={require("../../../assets/observe.svg")} />);
              }}
            />
          </ReactiveBase>
          <SeeMore to="/phase3/mission">Toutes les missions →</SeeMore>
        </Missions>
      </TransparentHero>
    </HeroContainer>
  );
};

const Heading = styled.div`
  margin-top: 40px;
  margin-bottom: 30px;
  h2 {
    color: #161e2e;
    font-size: 34px;
    font-weight: 700;
  }
  p {
    color: #6b7280;
    font-size: 18px;
  }
`;

const SeeMore = styled(Link)`
  :hover {
    color: #372f78;
  }
  cursor: pointer;
  color: #5145cd;
  font-size: 16px;
`;

const Missions = styled.div`
  padding: 40px;
  border-radius: 6px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  .pagination {
    display: none;
  }
`;

const TransparentHero = styled.div`
  padding: 0 2rem;
  max-width: 80rem;
  margin: 1rem auto;
`;
