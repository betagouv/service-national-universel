import React, { useEffect, useState } from "react";
import styled from "styled-components";

import CircularProgress from "../components/CircularProgress";

import api from "../../../services/api";
import Loader from "../../../components/Loader";
import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";

export default ({ filter }) => {
  const [value, setValue] = useState(null);

  useEffect(() => {
    (async () => {
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [] } },
        aggs: { status: { terms: { field: "populationDensity.keyword" } } },
        size: 0,
      };

      if (filter.status) body.query.bool.filter.push({ terms: { "status.keyword": filter.status } });
      if (filter.cohort) body.query.bool.filter.push({ term: { "cohort.keyword": filter.cohort } });
      if (filter.region) body.query.bool.filter.push({ term: { "region.keyword": filter.region } });
      if (filter.department) body.query.bool.filter.push({ term: { "department.keyword": filter.department } });

      const { responses } = await api.esQuery("young", body);
      if (responses.length) {
        const m = api.getAggregations(responses[0]);
        setValue(m);
      }
    })();
  }, [JSON.stringify(filter)]);

  function render() {
    if (!value) return <Loader />;
    const no = value["DENSE"] + value["INTERMEDIAIRE"] || 0;
    const yes = value["PEU DENSE"] + value["TRES PEU DENSE"] || 0;
    const noPercent = ((no * 100) / (no + yes)).toFixed(1);
    const yesPercent = ((yes * 100) / (no + yes)).toFixed(1);

    return (
      <Content>
        <CircularProgress circleProgressColor="#1B7BBF" percentage={noPercent} title={no} subtitle="Non" />
        <CircularProgress circleProgressColor="#1B7BBF" percentage={yesPercent} title={yes} subtitle="Oui" />
      </Content>
    );
  }

  return (
    <Box style={{ height: "fit-content" }}>
      <BoxHeadTitle>Issus d'une Zone Rurale</BoxHeadTitle>
      <BoxContent direction="column">{render()}</BoxContent>
    </Box>
  );
};

const Content = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  @media (max-width: 1550px) and (min-width: 992px) {
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
  }
  > * {
    margin-bottom: 1rem;
  }
`;
