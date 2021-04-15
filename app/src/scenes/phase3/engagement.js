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
          .sort((a, b) => {
            if (a.type === b.type) return 0;
            if (a.type === "Engagement") return -1;
            if (a.type === "Formation" && b.type !== "Engagement") return -1;
            else return 0;
          })
          .map((p, i) => (
            <Col key={i} md={4}>
              <ProgramCard program={p} image={p.imageFile ? p.imageFile : require(`../../assets/programmes-engagement/${p.imageString}`)} />
            </Col>
          ))}
      </Row>
    </Container>
  );
};

const Heading = styled.div`
  margin-bottom: 40px;
  h1 {
    color: #161e2e;
    font-size: 3rem;
    font-weight: 700;
    @media (max-width: 768px) {
      font-size: 1.2rem;
    }
  }
  p {
    color: #6b7280;
    font-size: 1rem;
    @media (max-width: 768px) {
      font-size: 0.9rem;
    }
  }
`;
