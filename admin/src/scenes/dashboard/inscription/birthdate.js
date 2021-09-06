import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import CircularProgress from "../components/CircularProgress";

import api from "../../../services/api";
import Loader from "../../../components/Loader";
import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";

export default ({ filter }) => {
  const [dates, setDates] = useState(null);

  useEffect(() => {
    (async () => {
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "cohort.keyword": filter.cohort } }] } },
        aggs: { views: { date_histogram: { field: "birthdateAt", interval: "year" } } },
        size: 0,
      };

      if (filter.status) body.query.bool.filter.push({ terms: { "status.keyword": filter.status } });
      if (filter.region) body.query.bool.filter.push({ term: { "region.keyword": filter.region } });
      if (filter.department) body.query.bool.filter.push({ term: { "department.keyword": filter.department } });

      const { responses } = await api.esQuery("young", body);
      if (responses.length) {
        let d = responses[0].aggregations.views.buckets;
        d = d.map((e) => ({ value: e.doc_count, name: e.key_as_string.split("-")[0] }));
        d = d.filter((e) => e.value);
        setDates(d);
      }
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
    <Box style={{ height: "fit-content" }}>
      <BoxHeadTitle>Année de naissance des volontaires</BoxHeadTitle>
      <BoxContent direction="column">{render()}</BoxContent>
    </Box>
  );
};
