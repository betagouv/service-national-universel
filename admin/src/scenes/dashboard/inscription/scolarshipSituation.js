import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import CircularProgress from "../components/CircularProgress";
import api from "../../../services/api";
import { translate } from "../../../utils";
import Loader from "../../../components/Loader";
import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";

export default function scholarshipSituation({ filter }) {
  const [value, setValue] = useState(null);

  useEffect(() => {
    (async () => {
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [] } },
        aggs: { status: { terms: { field: "situation.keyword" } } },
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

    const total = Object.keys(value).reduce((acc, e) => acc + value[e], 0);

    return (
      <Row style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        {Object.keys(value).map((e, i) => {
          return (
            <Col style={{ marginTop: "15px" }} key={i}>
              <CircularProgress circleProgressColor="#1B7BBF" percentage={((value[e] * 100) / total).toFixed(1)} title={value[e]} subtitle={translate(e)} />
            </Col>
          );
        })}
      </Row>
    );
  }

  return (
    <Box style={{ height: "fit-content" }}>
      <BoxHeadTitle>Situations</BoxHeadTitle>
      <BoxContent direction="column">{render()}</BoxContent>
    </Box>
  );
}
