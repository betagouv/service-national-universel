import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";

import CircularProgress from "../components/CircularProgress";

import api from "../../../services/api";
import Loader from "../../../components/Loader";
import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";

export default ({ filter }) => {
  const [handicap, setHandicap] = useState(null);
  const [ppsBeneficiary, setPpsBeneficiary] = useState(null);
  const [paiBeneficiary, setPaiBeneficiary] = useState(null);

  useEffect(() => {
    (async () => {
      const queries = [];
      queries.push({ index: "young", type: "_doc" });
      queries.push({
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "cohort.keyword": filter.cohort } }] } },
        aggs: {
          handicap: { terms: { field: "handicap.keyword" } },
          ppsBeneficiary: { terms: { field: "ppsBeneficiary.keyword" } },
          paiBeneficiary: { terms: { field: "paiBeneficiary.keyword" } },
        },
        size: 0,
      });

      if (filter.status) queries[1].query.bool.filter.push({ terms: { "status.keyword": filter.status } });
      if (filter.region) queries[1].query.bool.filter.push({ term: { "region.keyword": filter.region } });
      if (filter.department) queries[1].query.bool.filter.push({ term: { "department.keyword": filter.department } });

      //handicap
      try {
        const { responses } = await api.esQuery(queries);

        function transform(arr) {
          const t = arr.find((e) => e.key === "true");
          const f = arr.find((e) => e.key === "false");
          return { true: t ? t.doc_count : 0, false: f ? f.doc_count : 0 };
        }
        setHandicap(transform(responses[0].aggregations.handicap.buckets));
        setPpsBeneficiary(transform(responses[0].aggregations.ppsBeneficiary.buckets));
        setPaiBeneficiary(transform(responses[0].aggregations.paiBeneficiary.buckets));
      } catch (e) {}
    })();
  }, [JSON.stringify(filter)]);

  function render() {
    if (!handicap || !ppsBeneficiary || !paiBeneficiary) return <Loader />;
    return (
      <Row>
        <Col style={{ marginBottom: 15 }}>
          <CircularProgress
            circleProgressColor="#1B7BBF"
            percentage={((handicap.true * 100) / (handicap.true + handicap.false)).toFixed(1)}
            title={handicap.true}
            subtitle="En situation de handicap"
          />
        </Col>
        <Col style={{ marginBottom: 15 }}>
          <CircularProgress
            circleProgressColor="#1B7BBF"
            percentage={((ppsBeneficiary.true * 100) / (ppsBeneficiary.true + ppsBeneficiary.false)).toFixed(1)}
            title={ppsBeneficiary.true}
            subtitle="Bénéficiaires d’un PPS"
          />
        </Col>
        <Col style={{ marginBottom: 15 }}>
          <CircularProgress
            circleProgressColor="#1B7BBF"
            percentage={((paiBeneficiary.true * 100) / (paiBeneficiary.true + paiBeneficiary.false)).toFixed(1)}
            title={paiBeneficiary.true}
            subtitle="Bénéficiaires d’un PAI"
          />
        </Col>
      </Row>
    );
  }

  return (
    <Box style={{ height: "fit-content" }}>
      <BoxHeadTitle>Situations particulières</BoxHeadTitle>
      <BoxContent direction="column">{render()}</BoxContent>
    </Box>
  );
};
