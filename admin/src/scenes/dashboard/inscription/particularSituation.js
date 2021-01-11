import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Col, Row, Input } from "reactstrap";

import CircularProgress from "../components/CircularProgress";

import api from "../../../services/api";

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
      const { responses } = await api.esQuery(queries);

      function transform(arr) {
        const t = arr.find((e) => e.key === "true");
        const f = arr.find((e) => e.key === "false");
        return { true: t ? t.doc_count : 0, false: f ? f.doc_count : 0 };
      }
      setHandicap(transform(responses[0].aggregations.handicap.buckets));
      setPpsBeneficiary(transform(responses[0].aggregations.ppsBeneficiary.buckets));
      setPaiBeneficiary(transform(responses[0].aggregations.paiBeneficiary.buckets));
    })();
  }, [JSON.stringify(filter)]);

  function render() {
    if (!handicap || !ppsBeneficiary || !paiBeneficiary) return <div>Chargement ....</div>;
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
    <Box>
      <BoxTitle>Situations particulières</BoxTitle>
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
