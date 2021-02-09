import React, { useEffect, useState } from "react";
import styled from "styled-components";

import CircularProgress from "../components/CircularProgress";

import api from "../../../services/api";

export default ({ filter }) => {
  const [value, setValue] = useState(null);

  useEffect(() => {
    (async () => {
      const queries = [];
      queries.push({ index: "young", type: "_doc" });
      queries.push({
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "cohort.keyword": filter.cohort } }] } },
        aggs: { status: { terms: { field: "qpv.keyword" } } },
        size: 0,
      });

      if (filter.status) queries[1].query.bool.filter.push({ terms: { "status.keyword": filter.status } });
      if (filter.region) queries[1].query.bool.filter.push({ term: { "region.keyword": filter.region } });
      if (filter.department) queries[1].query.bool.filter.push({ term: { "department.keyword": filter.department } });

      const { responses } = await api.esQuery(queries);
      const m = api.getAggregations(responses[0]);
      setValue(m);
    })();
  }, [JSON.stringify(filter)]);

  function render() {
    if (!value) return <div>Chargement ....</div>;

    const no = value.false || 0;
    const yes = value.true || 0;
    const noPercent = ((no * 100) / (no + yes)).toFixed(1);
    const yesPercent = ((yes * 100) / (no + yes)).toFixed(1);

    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <CircularProgress circleProgressColor="#1B7BBF" percentage={noPercent} title={no} subtitle="Non QPV" />
        <CircularProgress circleProgressColor="#1B7BBF" percentage={yesPercent} title={yes} subtitle="QPV" />
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
