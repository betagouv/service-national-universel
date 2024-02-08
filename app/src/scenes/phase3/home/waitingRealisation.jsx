import Img4 from "../../../assets/observe.svg";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";

import ProgramCard from "../../../components/programCard";
import MissionCard from "../components/missionCard";
import api from "../../../services/api";
import { HeroContainer, Hero } from "../../../components/Content";
const images = import.meta.globEager("../../../assets/programmes-engagement/*");

export default function WaitingRealisation() {
  const young = useSelector((state) => state.Auth.young) || {};
  const [programs, setPrograms] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    (async () => {
      const { data, ok } = await api.get("/program");
      if (!ok) return toastr.error("Une erreur est survenue.");
      setPrograms(data);
    })();
    (async () => {
      if (!young.location?.lat) return;
      const filters = {
        location: {
          lat: young.location.lat,
          lon: young.location.lon,
        },
        distance: 0,
      };
      const res = await api.post("/elasticsearch/missionapi/search", { filters, page: 0, size: 3, sort: "geo" });
      if (!res?.data) return toastr.error("Oups, une erreur est survenue lors de la recherche des missions");
      setData(res.data);
    })();
  }, []);

  return (
    <HeroContainer>
      <TransparentHero>
        <Heading>
          <h2>Les autres programmes d&apos;engagement</h2>
          <p>Rejoignez plus de 100 000 jeunes français déjà engagés dans de grandes causes</p>
        </Heading>
        <Row>
          {programs.slice(0, 3).map((p, i) => (
            <Col key={i}>
              <ProgramCard program={p} image={p.imageFile ? p.imageFile : images[`../../../assets/programmes-engagement/${p.imageString}`]?.default} />
            </Col>
          ))}
        </Row>
        <SeeMore to="/les-programmes">Tous les programmes d&apos;engagement →</SeeMore>
        <hr style={{ margin: "40px 0", opacity: 0.8 }} />
      </TransparentHero>
      <TransparentHero>
        <Heading>
          <h2>Trouvez une mission de bénévolat à distance ou près de chez vous</h2>
          <p>Plus de 30 000 missions disponibles pour poursuivre votre engagement</p>
        </Heading>
        <Missions>
          {data?.total ? data?.hits.map((e) => <MissionCard mission={e._source} key={e._id} image={Img4} />) : null}
          <SeeMore to="/phase3/mission">Toutes les missions →</SeeMore>
        </Missions>
      </TransparentHero>
    </HeroContainer>
  );
}

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
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  .pagination {
    display: none;
  }
`;

const TransparentHero = styled.div`
  padding: 0 2rem;
  max-width: 80rem;
  margin: 1rem auto;
`;
