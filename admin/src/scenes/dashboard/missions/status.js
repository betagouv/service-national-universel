import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import { Link } from "react-router-dom";
import { CardArrow, Card, CardTitle, CardValueWrapper, CardValue, CardPercentage, CardSubtitle } from "../../../components/dashboard";
import { translate, MISSION_STATUS, MISSION_STATUS_COLORS } from "../../../utils";
import plausibleEvent from "../../../services/pausible";
import { ReactiveBase } from "@appbaseio/reactivesearch";
import { apiURL } from "../../../config";
import ExportComponent from "../../../components/ExportXlsx";
import api from "../../../services/api";

export default function Status({ data, filter, getLink, getExportQuery }) {
  const [total, setTotal] = useState();

  useEffect(() => {
    if (Object.keys(data).length !== 0) {
      setTotal(Object.keys(data).reduce((acc, a) => acc + data[a].doc_count, 0));
    }
  }, [data]);

  if (Object.keys(data).length === 0) {
    return null;
  }

  return (
    <React.Fragment>
      <div className="flex justify-between items-center mt-4 mb-2">
        <h3 className="text-xl">Statut des missions proposées par les structures</h3>
        <div>
          <ReactiveBase url={`${apiURL}/es`} app="mission" headers={{ Authorization: `JWT ${api.getToken()}` }}>
            <ExportComponent
              searchType="_msearch"
              handleClick={() => plausibleEvent("Mission/DashBoard - Exporter details places")}
              title="Exporter le détail des missions"
              defaultQuery={getExportQuery}
              exportTitle="Missions"
              index="mission"
              transform={async (data) => {
                const regions = data.aggregations.filtered.regions.buckets;
                let result = [];
                for (const region of regions) {
                  for (const department of region.departments.buckets) {
                    const status = department.status.buckets;
                    result.push({
                      Région: region.key,
                      Département: department.key,
                      "Brouillon - Nombre de missions déposées": status.find((stat) => stat.key === "DRAFT")?.doc_count || 0,
                      "Brouillon - Nombre de places proposées": status.find((stat) => stat.key === "DRAFT")?.placesTotal.value || 0,
                      "Brouillon - Nombre de places occupées": status.find((stat) => stat.key === "DRAFT")?.placesLeft.value || 0,
                      "En attente de correction - Nombre de missions déposées": status.find((stat) => stat.key === "WAITING_CORRECTION")?.doc_count || 0,
                      "En attente de correction - Nombre de places proposées": status.find((stat) => stat.key === "WAITING_CORRECTION")?.placesTotal.value || 0,
                      "En attente de correction - Nombre de places occupées": status.find((stat) => stat.key === "WAITING_CORRECTION")?.placesLeft.value || 0,
                      "Validée - Nombre de missions déposées": status.find((stat) => stat.key === "VALIDATED")?.doc_count || 0,
                      "Validée - Nombre de places proposées": status.find((stat) => stat.key === "VALIDATED")?.placesTotal.value || 0,
                      "Validée - Nombre de places occupées": status.find((stat) => stat.key === "VALIDATED")?.placesLeft.value || 0,
                      "Archivée - Nombre de missions déposées": status.find((stat) => stat.key === "ARCHIVED")?.doc_count || 0,
                      "Archivée - Nombre de places proposées": status.find((stat) => stat.key === "ARCHIVED")?.placesTotal.value || 0,
                      "Archivée - Nombre de places occupées": status.find((stat) => stat.key === "ARCHIVED")?.placesLeft.value || 0,
                      "Annulée - Nombre de missions déposées": status.find((stat) => stat.key === "CANCEL")?.doc_count || 0,
                      "Annulée - Nombre de places proposées": status.find((stat) => stat.key === "CANCEL")?.placesTotal.value || 0,
                      "Annulée - Nombre de places occupées": status.find((stat) => stat.key === "CANCEL")?.placesLeft.value || 0,
                    });
                  }
                }
                return result;
              }}
            />
          </ReactiveBase>
        </div>
      </div>
      <Row>
        {Object.values(MISSION_STATUS).map((l, k) => {
          return (
            <Col md={6} xl={3} key={k}>
              <Link to={getLink({ base: `/mission`, filter, filtersUrl: [`STATUS=%5B"${l}"%5D`] })}>
                <Card borderBottomColor={MISSION_STATUS_COLORS[l]}>
                  <CardTitle>{translate(l)}</CardTitle>
                  <CardValueWrapper>
                    <CardValue>{data[l]?.doc_count || 0}</CardValue>
                    <CardPercentage>
                      {total ? `${(((data[l]?.doc_count || 0) * 100) / total).toFixed(0)}%` : `0%`}
                      <CardArrow />
                    </CardPercentage>
                  </CardValueWrapper>
                  <CardSubtitle className="py-2">Places disponibles: {data[l]?.placesLeft || 0}</CardSubtitle>
                  <CardSubtitle>Places totales: {data[l]?.placesTotal || 0}</CardSubtitle>
                </Card>
              </Link>
            </Col>
          );
        })}
      </Row>
    </React.Fragment>
  );
}
