import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, Redirect } from "react-router-dom";

import api from "../../../services/api";

export default () => {
  const [missions, setMissions] = useState();
  const [volontairesTotal, setVolontairesTotal] = useState();
  const [volontaires, setVolontaires] = useState({});
  const [placesLeft, setPlacesLeft] = useState();
  const [placesTaken, setPlacesTaken] = useState();

  useEffect(() => {
    (async () => {
      const queries = [];
      queries.push({ index: "mission", type: "_doc" });
      queries.push({ query: { match_all: {} }, aggs: { left: { sum: { field: "placesLeft" } }, taken: { sum: { field: "placesTaken" } } }, size: 0 });

      queries.push({ index: "young", type: "_doc" });
      queries.push({ query: { match_all: {} }, aggs: { status: { terms: { field: "status.keyword" } } }, size: 0 });

      const { responses } = await api.esQuery(queries);

      const m = api.getTotal(responses[0]);
      setMissions(m);

      setPlacesLeft(responses[0].aggregations.left.value);
      setPlacesTaken(responses[0].aggregations.taken.value);

      const v = api.getTotal(responses[1]);
      setVolontairesTotal(v);

      const a = api.getAggregations(responses[1]);
      setVolontaires(a);
    })();
  }, []);

  return (
    <Wrapper>
      <Subtitle>RESPONSABLE</Subtitle>
      <Title>Dashboard</Title>
      <Card>
        <Link to="/mission">
          <div className="content">
            <CardTitle>Missions</CardTitle>
            <CardValue>{missions}</CardValue>
            <div style={{ display: "flex" }}>
              <CardContent>
                <div className="title">Places occupées</div>
                <div className="value">{placesTaken}</div>
              </CardContent>
              <CardContent>
                <div className="title">Places disponibles</div>
                <div className="value">{placesLeft}</div>
              </CardContent>
            </div>
          </div>
        </Link>
      </Card>
      <Card>
        <Link to="/volontaire">
          <div className="content">
            <CardTitle>VOLONTAIRES</CardTitle>
            <CardValue>{volontairesTotal}</CardValue>
            <div style={{ display: "flex" }}>
              <CardContent>
                <div className="title">Sans positionnement</div>
                <div className="value">{0}</div>
              </CardContent>
              <CardContent>
                <div className="title">En attente de validation</div>
                <div className="value">{volontaires["WAITING_VALIDATION"]}</div>
              </CardContent>
              <CardContent>
                <div className="title">Mission validée</div>
                <div className="value">0</div>
              </CardContent>
              <CardContent>
                <div className="title">Mission effectuée</div>
                <div className="value">0</div>
              </CardContent>
              <CardContent>
                <div className="title">Mission refusée</div>
                <div className="value">0</div>
              </CardContent>
            </div>
          </div>
        </Link>
      </Card>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 40px;
`;

const Subtitle = styled.div`
  color: rgb(113, 128, 150);
  font-weight: 400;
  text-transform: uppercase;
  font-size: 18px;
`;
const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 30px;
`;

const Card = styled.div`
  background-color: #fff;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px 0px, rgba(0, 0, 0, 0.06) 0px 1px 2px 0px;
  padding: 25px;
  margin-bottom: 20px;
`;

const CardTitle = styled.div`
  color: rgb(106, 111, 133);
  text-transform: uppercase;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 500;
`;

const CardValue = styled.div`
  color: rgb(49, 130, 206);
  margin-bottom: 30px;
  font-size: 22px;
  font-weight: 500;
`;

const CardContent = styled.div`
  margin-right: 30px;
  .title {
    color: rgb(160, 174, 192);
    text-transform: uppercase;
    font-size: 14px;
  }
  .subtitle {
    color: #fff;
  }
`;
