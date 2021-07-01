import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import ProgramCard from "./components/programCard";
import api from "../../services/api";
import VioletButton from "../../components/buttons/VioletButton";
import Loader from "../../components/Loader";
import { translate } from "../../utils";

export default () => {
  const [programs, setPrograms] = useState();
  const user = useSelector((state) => state.Auth.user);

  const getPrograms = async () => {
    const { data, ok, code } = await api.get("/program");
    if (!ok) return toastr.error("Une erreur est survenue.", translate(code));
    setPrograms(data);
  };
  useEffect(() => {
    getPrograms();
  }, []);

  const getTitle = () => {
    if (user.role === "head_center") return <Title>Outils pour les professionnels d'État</Title>;
    return <Title>Les grands programmes d'engagement</Title>;
  };

  if (!programs) return <Loader />;
  return (
    <>
      <Header>
        <div style={{ flex: 1 }}>{getTitle()}</div>
        {["referent_department", "referent_region", "admin"].includes(user.role) ? (
          <Link to="/contenu/create">
            <VioletButton>
              <p>Ajouter un nouveau dispositif</p>
            </VioletButton>
          </Link>
        ) : null}
      </Header>
      <Wrapper>
        {programs
          .sort((a, b) => {
            if (a.type === b.type) return 0;
            if (a.type === "Engagement") return -1;
            if (a.type === "Formation" && b.type !== "Engagement") return -1;
            else return 0;
          })
          .map((p, i) => (
            <Col key={i} md={3} sm={12} style={{ marginBottom: "1.5rem" }}>
              <ProgramCard onDelete={getPrograms} program={p} image={p.imageFile ? p.imageFile : require(`../../assets/programmes-engagement/${p.imageString || "default.png"}`)} />
            </Col>
          ))}
      </Wrapper>
    </>
  );
};

const Wrapper = styled(Row)`
  padding: 2rem;
`;

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
