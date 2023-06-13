import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { translate, YOUNG_STATUS_COLORS, getLink, typesStructure, legalStatus as legalStatusList } from "../../../utils";

import api from "../../../services/api";
import { CardArrow, Card, CardTitle, CardValueWrapper, CardValue, CardPercentage } from "../../../components/dashboard";

export default function Status({ filter }) {
  const [legalStatus, setLegalStatus] = useState({});
  const [types, setTypes] = useState({});
  const [sousType, setSousType] = useState({});
  const [withNetworkId, setWithNetworkId] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function initStatus() {
      const body = {
        query: { bool: { must: { match_all: {} }, filter: [] } },
        aggs: {
          legalStatus: { terms: { field: "legalStatus.keyword" } },
          types: { terms: { field: "types.keyword" } },
          sousType: { terms: { field: "sousType.keyword" } },
          withNetworkId: { filter: { bool: { must: { exists: { field: "networkId.keyword" } }, must_not: { term: { "networkId.keyword": "" } } } } },
        },

        size: 0,
      };

      if (filter.region?.length) body.query.bool.filter.push({ terms: { "region.keyword": filter.region } });
      if (filter.department?.length) body.query.bool.filter.push({ terms: { "department.keyword": filter.department } });

      const { responses } = await api.esQuery("structure", body);
      {
        console.log(responses);
      }
      if (responses.length) {
        setLegalStatus(responses[0].aggregations.legalStatus.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
        setTypes(responses[0].aggregations.types.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
        setSousType(responses[0].aggregations.sousType.buckets.reduce((acc, c) => ({ ...acc, [c.key]: c.doc_count }), {}));
        setTotal(responses[0].hits.total.value);
        setWithNetworkId(responses[0].aggregations.withNetworkId.doc_count);
      }
    }
    initStatus();
  }, [JSON.stringify(filter)]);

  return (
    <>
      <Row>
        <Col md={6} xl={6}>
          <Link to={getLink({ base: `/structure`, filter })}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
              <CardTitle>Structures</CardTitle>
              <CardValueWrapper>
                <CardValue>{total || 0}</CardValue>
                <CardArrow />
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
        <Col md={6} xl={6}>
          <Link to={getLink({ base: `/structure`, filter })}>
            <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS}>
              <CardTitle>Affiliées à un réseau national</CardTitle>
              <CardValueWrapper>
                <CardValue>{withNetworkId || 0}</CardValue>
                <CardArrow />
              </CardValueWrapper>
            </Card>
          </Link>
        </Col>
      </Row>
      {legalStatusList
        .map((l, k) => {
          return (
            <div className="flex" key={k}>
              <Col md={6} xl={3}>
                <Link to={getLink({ base: `/structure`, filter, filtersUrl: [`legalStatus=${l}`] })}>
                  <Card borderBottomColor={YOUNG_STATUS_COLORS.IN_PROGRESS} style={{ marginBottom: 0 }}>
                    <CardTitle>{`${translate(l)}s`}</CardTitle>
                    <CardValueWrapper>
                      <CardValue>{legalStatus[l] || 0}</CardValue>
                      <CardPercentage>
                        {total ? `${(((legalStatus[l] || 0) * 100) / total).toFixed(0)}%` : `0%`}
                        <CardArrow />
                      </CardPercentage>
                    </CardValueWrapper>
                  </Card>
                </Link>
              </Col>
              <div className="flex flex-row flex-wrap items-start gap-2">
                {(typesStructure[l] || []).map((type, tk) => {
                  return (
                    <Link key={tk} to={getLink({ base: `/structure`, filter, filtersUrl: [`legalStatus=${l}`, `types=${type}`] })}>
                      <div className="flex cursor-pointer flex-col rounded-md bg-white p-3 shadow-sm hover:scale-105">
                        <div>{translate(type)}</div>
                        <div className="flex justify-between text-xl">
                          <div>{types[type] || 0}</div>
                          <div className="text-base text-coolGray-400">
                            {legalStatus[l] ? `${(((types[type] || 0) * 100) / legalStatus[l]).toFixed(0)}%` : `0%`}
                            <CardArrow />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })
        .reduce((prev, curr, i) => [prev, <hr key={`${prev} ${i}`} className="my-4 mx-24" />, curr])}
    </>
  );
}
