import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { HeroContainer } from "../../components/Content";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";
import { RiArrowLeftSLine } from "react-icons/ri";

// import ProgramCard from "../phase3/components/programCard";
import api from "../../services/api";
import Loader from "../../components/Loader";
import EngagementCard from "@/scenes/preinscription/components/EngagementCard";

export default function Index() {
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
    <div className="pt-2 mb-4 pb-4 sm:px-4 md:px-16 md:pb-6 md:pt-6 md:mx-6 md:mt-10 rounded-lg bg-white">
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
      <div className="flex gap-8 overflow-x-auto md:grid md:grid-cols-3">
        {programs.map((program, index) => (
          <EngagementCard program={program} key={index} />
        ))}
      </div>
    </div>
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
