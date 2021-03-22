import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";

import ProgramCard from "./components/programCard";
import api from "../../services/api";
import VioletHeaderButton from "../../components/buttons/VioletHeaderButton";

export default () => {
  const [programs, setPrograms] = useState();
  useEffect(() => {
    (async () => {
      const { data, ok, code } = await api.get("/program");
      if (!ok) return toastr.error("nope");
      setPrograms(data);
    })();
  }, []);
  if (!programs) return <div>Chargéééé !!</div>;
  return (
    <>
      <Header>
        <div style={{ flex: 1 }}>
          <Title>Les grands programmes d'engagement</Title>
          <Subtitle>Rejoignez plus 100 000 jeunes français déjà engagés dans de grandes causes</Subtitle>
        </div>
        <Link to="/contenu/create">
          <VioletHeaderButton>
            <p>Nouveau</p>
          </VioletHeaderButton>
        </Link>
      </Header>
      <Container>
        <Row>
          {programs.map((p, i) => (
            <Col key={i} md={4}>
              <ProgramCard program={p} image={p.imageFile ? p.imageFile : require(`../../assets/programmes-engagement/${p.imageString || "default.png"}`)} />
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
};

const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
`;

const Subtitle = styled.div`
  color: #6b7280;
  font-size: 18px;
`;

const Header = styled.div`
  padding: 0 25px 0;
  display: flex;
  margin: 25px 0;
  align-items: flex-start;
  /* justify-content: space-between; */
`;

const Heading = styled.div`
  margin: 2rem 0;
  h1 {
    color: #161e2e;
    font-size: 2px;
    font-weight: 700;
  }
  p {
    color: #6b7280;
    font-size: 18px;
  }
`;
