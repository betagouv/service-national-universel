import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";

import ProgramCard from "./components/programCard";
import api from "../../services/api";
import VioletButton from "../../components/buttons/VioletButton";
import Loader from "../../components/Loader";
import { translate, ROLES } from "../../utils";

export default function List() {
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
    if (user.role === ROLES.HEAD_CENTER) return <Title>Outils pour les professionnels d&apos;État</Title>;
    return <Title>Les grands programmes d&apos;engagement</Title>;
  };

  if (!programs) return <Loader />;
  return (
    <>
      <Header>
        <div style={{ flex: 1 }}>{getTitle()}</div>
        {[ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION, ROLES.ADMIN].includes(user.role) ? (
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
            <div key={i} style={{ marginBottom: "1.5rem" }}>
              <ProgramCard onDelete={getPrograms} program={p} image={p.imageFile ? p.imageFile : require(`../../assets/programmes-engagement/${p.imageString || "default.png"}`)} />
            </div>
          ))}
      </Wrapper>
    </>
  );
}

const Wrapper = styled.div`
  padding: 2rem;
  display: grid;
  grid-gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
`;

const Header = styled.div`
  padding: 0 25px 0;
  display: flex;
  margin: 25px 0;
  align-items: flex-start;
  /* justify-content: space-between; */
`;
