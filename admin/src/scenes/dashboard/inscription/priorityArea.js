import React, { useEffect, useState } from "react";
import styled from "styled-components";

import CircularProgress from "../components/CircularProgress";

import api from "../../../services/api";

export default () => {
  const [value, setValue] = useState(null);

  useEffect(() => {
    (async () => {
      // const queries = [];
      // queries.push({ index: "young", type: "_doc" });
      // queries.push({ query: { match_all: {} }, aggs: { status: { terms: { field: "gender.keyword" } } }, size: 0 });
      // const { responses } = await api.esQuery(queries);
      // const m = api.getAggregations(responses[0]);
      // setValue(m);
    })();
  }, []);

  function render() {
    if (!value) return <div>Chargement ....</div>;

    // const male = gender.male || 0;
    // const female = gender.female || 0;
    // const malePercent = ((male * 100) / (male + female)).toFixed(1);
    // const femalePercent = ((female * 100) / (male + female)).toFixed(1);

    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        {/* <CircularProgress circleProgressColor="#1B7BBF" percentage={malePercent} title={male} subtitle="Garçons" />
        <CircularProgress circleProgressColor="#1B7BBF" percentage={femalePercent} title={female} subtitle="Filles" /> */}
      </div>
    );
  }

  return (
    <Box>
      <BoxTitle>Quartiers prioritaires de la ville</BoxTitle>
      <BoxContent direction="column">{render()}</BoxContent>
    </Box>
  );
};

const Box = styled.div`
  background-color: #fff;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  margin-bottom: 33px;
  border-radius: 8px;
`;
const BoxTitle = styled.h3`
  padding: 22px;
  color: #171725;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid #f2f1f1;
`;
const BoxContent = styled.div`
  padding: 30px;
  display: flex;
  flex-direction: ${(props) => props.direction};
  & > * {
    ${(props) => props.direction === "column" && ` margin-bottom: 25px;`}
  }
`;
