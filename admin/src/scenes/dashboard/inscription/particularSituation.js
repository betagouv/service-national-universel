import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";

import CircularProgress from "../components/CircularProgress";

import api from "../../../services/api";
import Loader from "../../../components/Loader";
import { Box, BoxContent, BoxHeadTitle } from "../../../components/box";
import { getLink, ROLES } from "../../../utils";
import { useSelector } from "react-redux";

export default function ParticularSituation({ filter }) {
  const [handicap, setHandicap] = useState(null);
  const [ppsBeneficiary, setPpsBeneficiary] = useState(null);
  const [paiBeneficiary, setPaiBeneficiary] = useState(null);
  const [specificAmenagment, setSpecificAmenagment] = useState(null);
  const [allergies, setAllergies] = useState(null);
  const [handicapInSameDepartment, setHandicapInSameDepartment] = useState(null);
  const [highSkilledActivity, setHighSkilledActivity] = useState(null);
  const [reducedMobilityAccess, setReducedMobilityAccess] = useState(null);
  const user = useSelector((state) => state.Auth.user);

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
      if (filter.cohort?.length) body.query.bool.filter.push({ terms: { "cohort.keyword": filter.cohort } });
      if (filter.region?.length) body.query.bool.filter.push({ terms: { "region.keyword": filter.region } });
      if (filter.department?.length) body.query.bool.filter.push({ terms: { "department.keyword": filter.department } });
      if (filter.academy?.length) body.query.bool.filter.push({ terms: { "academy.keyword": filter.academy } });

      //handicap
      const { responses } = await api.esQuery("young", body);

      if (responses.length) {
        // eslint-disable-next-line no-inner-declarations
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
    // we compute the total from the 'handicap' aggregation because it is mandatory, so the total IS the total
    const total = handicap?.true + handicap?.false;
    return (
      <Row>
        {handicap ? (
          <LinkItem link={getLink({ base: `/inscription`, filter, filtersUrl: ['HANDICAP=%5B"true"%5D'] })} disabled={user.role === ROLES.VISITOR}>
            <CircularProgress circleProgressColor="#1B7BBF" percentage={((handicap.true * 100) / total).toFixed(1)} title={handicap.true} subtitle="En situation de handicap" />
          </LinkItem>
        ) : (
          <Loader />
        )}
        {ppsBeneficiary ? (
          <LinkItem link={getLink({ base: `/inscription`, filter, filtersUrl: ['PPS=%5B"true"%5D'] })} disabled={user.role === ROLES.VISITOR}>
            <CircularProgress
              circleProgressColor="#1B7BBF"
              percentage={((ppsBeneficiary.true * 100) / total).toFixed(1)}
              title={ppsBeneficiary.true}
              subtitle="Bénéficiaires d’un PPS"
            />
          </LinkItem>
        ) : (
          <Loader />
        )}
        {paiBeneficiary ? (
          <LinkItem link={getLink({ base: `/inscription`, filter, filtersUrl: ['PAI=%5B"true"%5D'] })} disabled={user.role === ROLES.VISITOR}>
            <CircularProgress
              circleProgressColor="#1B7BBF"
              percentage={((paiBeneficiary.true * 100) / total).toFixed(1)}
              title={paiBeneficiary.true}
              subtitle="Bénéficiaires d’un PAI"
            />
          </LinkItem>
        ) : (
          <Loader />
        )}
        {specificAmenagment ? (
          <LinkItem disabled>
            <CircularProgress
              circleProgressColor="#1B7BBF"
              percentage={((specificAmenagment.true * 100) / total).toFixed(1)}
              title={specificAmenagment.true}
              subtitle="Aménagement spécifique"
            />
          </LinkItem>
        ) : (
          <Loader />
        )}
        {allergies ? (
          <LinkItem disabled>
            <CircularProgress circleProgressColor="#1B7BBF" percentage={((allergies.true * 100) / total).toFixed(1)} title={allergies.true} subtitle="Allergie/intolérance" />
          </LinkItem>
        ) : (
          <Loader />
        )}
        {handicapInSameDepartment ? (
          <LinkItem disabled>
            <CircularProgress
              circleProgressColor="#1B7BBF"
              percentage={((handicapInSameDepartment.true * 100) / total).toFixed(1)}
              title={handicapInSameDepartment.true}
              subtitle="Affectation dans le département de résidence"
            />
          </LinkItem>
        ) : (
          <Loader />
        )}
        {highSkilledActivity ? (
          <LinkItem disabled>
            <CircularProgress
              circleProgressColor="#1B7BBF"
              percentage={((highSkilledActivity.true * 100) / total).toFixed(1)}
              title={highSkilledActivity.true}
              subtitle="Sportif de haut-niveau"
            />
          </LinkItem>
        ) : (
          <Loader />
        )}
        {reducedMobilityAccess ? (
          <LinkItem disabled>
            <CircularProgress
              circleProgressColor="#1B7BBF"
              percentage={((reducedMobilityAccess.true * 100) / total).toFixed(1)}
              title={reducedMobilityAccess.true}
              subtitle="Aménagement pour mobilité réduite"
            />
          </LinkItem>
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
}

function LinkItem({ children, link = null, disabled }) {
  if (disabled) return <Col style={{ marginBottom: 15 }}>{children}</Col>;
  return (
    <Link to={link}>
      <Col style={{ marginBottom: 15 }}>{children}</Col>
    </Link>
  );
}
