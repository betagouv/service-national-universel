import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

import CircularProgress from "../components/CircularProgress";

import api from "../../../services/api";
import Loader from "../../../components/Loader";
import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import { getLink } from "../../../utils";

export default ({ filter }) => {
  const [value, setValue] = useState(null);

  useEffect(() => {
    (async () => {
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [] } },
        aggs: { status: { terms: { field: "qpv.keyword" } } },
        size: 0,
      };

      if (filter.status) body.query.bool.filter.push({ terms: { "status.keyword": filter.status } });
      if (filter.cohort?.length) body.query.bool.filter.push({ terms: { "cohort.keyword": filter.cohort } });
      if (filter.region?.length) body.query.bool.filter.push({ terms: { "region.keyword": filter.region } });
      if (filter.department?.length) body.query.bool.filter.push({ terms: { "department.keyword": filter.department } });
      if (filter.academy?.length) body.query.bool.filter.push({ terms: { "academy.keyword": filter.academy } });

      const { responses } = await api.esQuery("young", body);
      if (responses.length) {
        const m = api.getAggregations(responses[0]);
        setValue(m);
      }
    })();
  }, [JSON.stringify(filter)]);

  function render() {
    if (!value) return <Loader />;

    const no = value.false || 0;
    const yes = value.true || 0;
    const noPercent = ((no * 100) / (no + yes)).toFixed(1);
    const yesPercent = ((yes * 100) / (no + yes)).toFixed(1);

    return (
      <Content>
        <Link to={getLink({ base: `/inscription`, filter, filtersUrl: ['QPV=%5B"false"%5D'] })}>
          <CircularProgress circleProgressColor="#1B7BBF" percentage={noPercent} title={no} subtitle="Non" />
        </Link>
        <Link to={getLink({ base: `/inscription`, filter, filtersUrl: ['QPV=%5B"true"%5D'] })}>
          <CircularProgress circleProgressColor="#1B7BBF" percentage={yesPercent} title={yes} subtitle="Oui" />
        </Link>
      </Content>
    );
  }

  return (
    <Box style={{ height: "fit-content" }}>
      <BoxHeadTitle>Issus d'un Quartier Prioritaire de la Ville</BoxHeadTitle>
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
