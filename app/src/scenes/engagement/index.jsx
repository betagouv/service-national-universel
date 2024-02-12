import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Col, Row } from "reactstrap";
import { HeroContainer } from "../../components/Content";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { RiArrowLeftSLine } from "react-icons/ri";

// import ProgramCard from "../phase3/components/programCard";
import ProgramCard from "../../components/programCard";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { useSelector } from "react-redux";

const images = import.meta.globEager("../../assets/programmes-engagement/*");

export default function Index() {
  const young = useSelector((state) => state.Auth.young);
  const [programs, setPrograms] = useState();
  useEffect(() => {
    (async () => {
      const { data, ok } = await api.get("/program");
      if (!ok) return toastr.error("nope");
      setPrograms(data);
    })();
  }, []);
  if (!programs) return <Loader />;
  return (
    <HeroContainer>
      <div className="pt-2 pb-4 sm:px-4 md:px-16 md:pb-6 md:pt-6 md:mx-6 md:mt-10 rounded-lg bg-white">
        <Link to="/autres-engagements">
          <button className="mt-4 mb-6 flex py-2 px-2 border rounded-lg text-xs leading-4 font-medium">
            <RiArrowLeftSLine className="mr-2 text-lg" />
            Retour
          </button>
        </Link>
        <Heading>
          <h1>Tous les autres programmes d&apos;engagement</h1>
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
                <ProgramCard program={p} image={p.imageFile ? p.imageFile : images[`../../assets/programmes-engagement/${p.imageString}`]?.default} />
              </Col>
            ))}
        </Row>
      </div>
    </HeroContainer>
  );
}

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
