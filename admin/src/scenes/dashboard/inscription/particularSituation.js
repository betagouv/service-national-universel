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
  const [specificAmenagment, setSpecificAmenagment] = useState(null);
  const [allergies, setAllergies] = useState(null);
  const [handicapInSameDepartment, setHandicapInSameDepartment] = useState(null);
  const [highSkilledActivity, setHighSkilledActivity] = useState(null);
  const [reducedMobilityAccess, setReducedMobilityAccess] = useState(null);

  useEffect(() => {
    (async () => {
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [] } },
        aggs: {
          handicap: { terms: { field: "handicap.keyword" } },
          ppsBeneficiary: { terms: { field: "ppsBeneficiary.keyword" } },
          paiBeneficiary: { terms: { field: "paiBeneficiary.keyword" } },
          specificAmenagment: { terms: { field: "specificAmenagment.keyword" } },
          allergies: { terms: { field: "allergies.keyword" } },
          handicapInSameDepartment: { terms: { field: "handicapInSameDepartment.keyword" } },
          highSkilledActivity: { terms: { field: "highSkilledActivity.keyword" } },
          reducedMobilityAccess: { terms: { field: "reducedMobilityAccess.keyword" } },
        },
        size: 0,
      };

      if (filter.status) body.query.bool.filter.push({ terms: { "status.keyword": filter.status } });
      if (filter.cohort) body.query.bool.filter.push({ term: { "cohort.keyword": filter.cohort } });
      if (filter.region) body.query.bool.filter.push({ term: { "region.keyword": filter.region } });
      if (filter.department) body.query.bool.filter.push({ term: { "department.keyword": filter.department } });

      //handicap
      const { responses } = await api.esQuery("young", body);

      if (responses.length) {
        function transform(arr) {
          const t = arr.find((e) => e.key === "true");
          const f = arr.find((e) => e.key === "false");
          return { true: t ? t.doc_count : 0, false: f ? f.doc_count : 0 };
        }
        setHandicap(transform(responses[0].aggregations.handicap.buckets));
        setPpsBeneficiary(transform(responses[0].aggregations.ppsBeneficiary.buckets));
        setPaiBeneficiary(transform(responses[0].aggregations.paiBeneficiary.buckets));
        setSpecificAmenagment(transform(responses[0].aggregations.specificAmenagment.buckets));
        setAllergies(transform(responses[0].aggregations.allergies.buckets));
        setHandicapInSameDepartment(transform(responses[0].aggregations.handicapInSameDepartment.buckets));
        setHighSkilledActivity(transform(responses[0].aggregations.highSkilledActivity.buckets));
        setReducedMobilityAccess(transform(responses[0].aggregations.reducedMobilityAccess.buckets));
      }
    })();
  }, [JSON.stringify(filter)]);

  function render() {
    if (!handicap || !ppsBeneficiary || !paiBeneficiary || !specificAmenagment) return <Loader />;
    const totalhandicap = handicap.true + handicap.false;
    const totalspecificAmenagment = specificAmenagment.true + specificAmenagment.false;
    console.log(totalhandicap, totalspecificAmenagment);
    return (
      <Row>
        {handicap ? (
          <Col style={{ marginBottom: 15 }}>
            <CircularProgress
              circleProgressColor="#1B7BBF"
              percentage={((handicap.true * 100) / (handicap.true + handicap.false)).toFixed(1)}
              title={handicap.true}
              subtitle="En situation de handicap"
            />
          </Col>
        ) : (
          <Loader />
        )}
        {ppsBeneficiary ? (
          <Col style={{ marginBottom: 15 }}>
            <CircularProgress
              circleProgressColor="#1B7BBF"
              percentage={((ppsBeneficiary.true * 100) / (ppsBeneficiary.true + ppsBeneficiary.false)).toFixed(1)}
              title={ppsBeneficiary.true}
              subtitle="Bénéficiaires d’un PPS"
            />
          </Col>
        ) : (
          <Loader />
        )}
        {paiBeneficiary ? (
          <Col style={{ marginBottom: 15 }}>
            <CircularProgress
              circleProgressColor="#1B7BBF"
              percentage={((paiBeneficiary.true * 100) / (paiBeneficiary.true + paiBeneficiary.false)).toFixed(1)}
              title={paiBeneficiary.true}
              subtitle="Bénéficiaires d’un PAI"
            />
          </Col>
        ) : (
          <Loader />
        )}
        {specificAmenagment ? (
          <Col style={{ marginBottom: 15 }}>
            <CircularProgress
              circleProgressColor="#1B7BBF"
              percentage={((specificAmenagment.true * 100) / (specificAmenagment.true + specificAmenagment.false)).toFixed(1)}
              title={specificAmenagment.true}
              subtitle="Aménagement spécifique"
            />
          </Col>
        ) : (
          <Loader />
        )}
        {allergies ? (
          <Col style={{ marginBottom: 15 }}>
            <CircularProgress
              circleProgressColor="#1B7BBF"
              percentage={((allergies.true * 100) / (allergies.true + allergies.false)).toFixed(1)}
              title={allergies.true}
              subtitle="Allergie/intolérance"
            />
          </Col>
        ) : (
          <Loader />
        )}
        {handicapInSameDepartment ? (
          <Col style={{ marginBottom: 15 }}>
            <CircularProgress
              circleProgressColor="#1B7BBF"
              percentage={((handicapInSameDepartment.true * 100) / (handicapInSameDepartment.true + handicapInSameDepartment.false)).toFixed(1)}
              title={handicapInSameDepartment.true}
              subtitle="Affectation dans le département de résidence"
            />
          </Col>
        ) : (
          <Loader />
        )}
        {highSkilledActivity ? (
          <Col style={{ marginBottom: 15 }}>
            <CircularProgress
              circleProgressColor="#1B7BBF"
              percentage={((highSkilledActivity.true * 100) / (highSkilledActivity.true + highSkilledActivity.false)).toFixed(1)}
              title={highSkilledActivity.true}
              subtitle="Sportif de haut-niveau"
            />
          </Col>
        ) : (
          <Loader />
        )}
        {reducedMobilityAccess ? (
          <Col style={{ marginBottom: 15 }}>
            <CircularProgress
              circleProgressColor="#1B7BBF"
              percentage={((reducedMobilityAccess.true * 100) / (reducedMobilityAccess.true + reducedMobilityAccess.false)).toFixed(1)}
              title={reducedMobilityAccess.true}
              subtitle="Aménagement pour mobilité réduite"
            />
          </Col>
        ) : (
          <Loader />
        )}
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
