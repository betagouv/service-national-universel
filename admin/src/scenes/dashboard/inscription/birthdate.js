import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import CircularProgress from "../components/CircularProgress";

import api from "../../../services/api";
import Loader from "../../../components/Loader";

export default ({ filter }) => {
  const [dates, setDates] = useState(null);

  useEffect(() => {
    (async () => {
      const queries = [];
      queries.push({ index: "young", type: "_doc" });
      queries.push({
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "cohort.keyword": filter.cohort } }] } },
        aggs: { views: { date_histogram: { field: "birthdateAt", interval: "year" } } },
        size: 0,
      });

      if (filter.status) queries[1].query.bool.filter.push({ terms: { "status.keyword": filter.status } });
      if (filter.region) queries[1].query.bool.filter.push({ term: { "region.keyword": filter.region } });
      if (filter.department) queries[1].query.bool.filter.push({ term: { "department.keyword": filter.department } });

      const res = await api.esQuery(queries);
      let d = res.responses[0].aggregations.views.buckets;
      d = d.map((e) => ({ value: e.doc_count, name: e.key_as_string.split("-")[0] }));
      d = d.filter((e) => e.value);
      setDates(d);
    })();
  }, [JSON.stringify(filter)]);

  function render() {
    if (!dates) return <Loader />;
    const total = dates.reduce((acc, v) => acc + v.value, 0);
    return (
      <Row style={{ display: "flex", justifyContent: "space-around" }}>
        {dates.map((e, i) => {
          const percent = ((e.value * 100) / total).toFixed(1);
          return (
            <Col style={{ marginBottom: "15px" }} key={i}>
              <CircularProgress circleProgressColor="#5245CC" percentage={percent} title={e.value} subtitle={`nées en ${e.name}`} />
            </Col>
          );
        })}
      </Row>
    );
  }

  return (
    <Box>
      <BoxTitle>Année de naissance des volontaires</BoxTitle>
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
