import Img4 from "../../../assets/observe.svg";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Row, Col } from "reactstrap";
import styled from "styled-components";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import ArrowUpRight from "../../../assets/icons/ArrowUpRight";

import ProgramCard from "../../../components/programCard";
import MissionCard from "../components/missionCard";
import api from "../../../services/api";
import { HeroContainer } from "../../../components/Content";
import ButtonLinkPrimary from "@/components/ui/buttons/ButtonLinkPrimary";
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
        <ButtonLinkPrimary to="/les-programmes" className="flex w-full justify-center">
          Voir toutes les possibilités d'engagement
        </ButtonLinkPrimary>
        <hr style={{ margin: "100px 0 0 0", opacity: 0.8 }} />
        <div className="mb-2">
          <h2 className="text-[#161e2e] text-4xl font-bold">Trouvez une mission de bénévolat ou de volontariat</h2>
          <p className="text-gray-500 text-xl mt-2">Plus de 30 000 missions disponibles pour poursuivre votre engagement</p>
        </div>
        <Missions>
          {data?.total ? data?.hits.map((e) => <MissionCard mission={e._source} key={e._id} image={Img4} />) : null}
          <ButtonLinkPrimary to="/phase3/mission" className="flex w-full justify-center">
            Rechercher une mission
          </ButtonLinkPrimary>
        </Missions>
        <hr className="pb-2 mt-4 hidden md:block" />
        <div className="mb-4 mt-4 pb-8 flex flex-col md:flex-row space-x-5 px-1">
          <div className="flex md:w-1/2 cursor-pointer rounded-lg py-2 border-[1px] bg-white border-gray-200 hover:border-gray-300">
            <a
              href="https://support.snu.gouv.fr/base-de-connaissance/phase-2-la-mission-dinteret-general-1"
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-start justify-between gap-1 p-3">
              <div className="flex-1 font-bold text-gray-800">J’ai des questions sur la phase 2</div>
              <ArrowUpRight className="text-2xl text-gray-400 group-hover:scale-105" />
            </a>
          </div>
          <div className="flex md:w-1/2 cursor-pointer rounded-lg py-2 border-[1px] bg-white border-gray-200 hover:border-gray-300">
            <a
              href="https://support.snu.gouv.fr/base-de-connaissance/demander-la-reconnaissance-dun-engagement-deja-realise-1"
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-start justify-between gap-1 ml-0 p-3">
              <div className="flex-1 font-bold text-gray-800">J’ai des questions sur la reconnaissance d'engagement</div>
              <ArrowUpRight className="text-2xl text-gray-400 group-hover:scale-105" />
            </a>
          </div>
        </div>
      </TransparentHero>
    </HeroContainer>
  );
}

const Heading = styled.div`
  margin-top: 40px;
  padding-top: 15px;
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

const Missions = styled.div`
  padding: 40px;
  .pagination {
    display: none;
  }
`;

const TransparentHero = styled.div`
  padding: 0 2rem;
  border-radius: 6px;
  max-width: 80rem;
  margin: 1rem auto;
  background: #fff;
`;
