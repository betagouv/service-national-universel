import React, { useEffect, useState } from "react";
import { toastr } from "react-redux-toastr";
import { Col, Row } from "reactstrap";
import styled from "styled-components";

import useDocumentTitle from "@/hooks/useDocumentTitle";
import api from "@/services/api";
import { department2region, departmentList, region2department } from "@/utils";

import Loader from "@/components/Loader";
import LoadingButton from "@/components/buttons/LoadingButton";
import SelectCohort from "@/components/cohorts/SelectCohort";

import ToggleBloc from "./ToggleBloc";

export default function Goal() {
  useDocumentTitle("Objectifs");

  const [inscriptionGoals, setInscriptionGoals] = useState<{ department: string; region: string; max: null | number }[]>();
  const [loading, setLoading] = useState(false);
  const [blocsOpened, setBlocsOpened] = useState([]);
  const [cohort, setCohort] = useState(null);

  useEffect(() => {
    if (!cohort) setCohort("Février 2024 - C");
  }, []);

  const getInscriptionGoals = async () => {
    if (!cohort) return;
    const { data, ok } = await api.get(`/inscription-goal/${cohort}`);
    if (!ok) return toastr.error("Impossible de charger les objectifs d'inscription", "");
    setInscriptionGoals(departmentList.map((d) => data.find((e) => e.department === d) || { department: d, region: department2region[d], max: null }));
  };
  useEffect(() => {
    getInscriptionGoals();
  }, [cohort]);

  if (!inscriptionGoals || !cohort) return <Loader />;

  return (
    <>
      <Header>
        <div style={{ flex: 1 }}>
          <Title>Objectifs d&apos;inscriptions au SNU</Title>
        </div>
        <div className="flex items-center gap-2">
          <LoadingButton
            loading={loading}
            onClick={async () => {
              setLoading(true);
              await api.post(`/inscription-goal/${cohort}`, inscriptionGoals);
              setLoading(false);
            }}>
            Enregistrer
          </LoadingButton>
          <SelectCohort
            cohort={cohort}
            filterFn={(c) => !c.name.includes("CLE")}
            onChange={(cohortName) => {
              setCohort(cohortName);
            }}
          />
        </div>
      </Header>

      <div style={{ flex: "2 1 0%", position: "relative", padding: "3rem" }}>
        {Object.entries(region2department).map(([region, departements]) => {
          const total = inscriptionGoals
            .filter((ig) => ig.region === region)
            .reduce((acc, current) => acc + (current.max && !isNaN(Number(current.max)) ? Number(current.max) : 0), 0);
          return (
            <ToggleBloc
              visible={blocsOpened.includes(region)}
              title={
                <>
                  {region}
                  {total ? <small style={{ color: "#888", marginLeft: "0.5rem", fontWeight: "normal" }}>• Objectif {total} inscrits</small> : null}
                </>
              }
              key={region}
              onClick={() => {
                setBlocsOpened(blocsOpened.includes(region) ? blocsOpened.filter((b) => b !== region) : [...blocsOpened, region]);
              }}>
              {departements
                .filter((departement) => departement !== "Corse")
                .map((department) => {
                  return (
                    <Departement key={department}>
                      <Row>
                        <Col md={8}>
                          <Row>
                            <Col md={4} style={{ alignSelf: "center" }}>
                              {department}
                            </Col>
                            <Col md={8}>
                              <input
                                onChange={(e) => {
                                  const val = e.target.value && !isNaN(Number(e.target.value)) ? Number(e.target.value) : null;
                                  setInscriptionGoals(inscriptionGoals.map((ig) => (ig.department === department ? { ...ig, max: val } : ig)));
                                }}
                                value={inscriptionGoals.find((ig) => ig.department === department)?.max || ""}
                                className="form-control"
                                style={{ width: "75px", display: "inline-block", marginRight: "1rem" }}
                              />
                              volontaires
                            </Col>
                          </Row>
                        </Col>
                      </Row>
                    </Departement>
                  );
                })}
            </ToggleBloc>
          );
        })}
      </div>
    </>
  );
}

const Departement = styled.div`
  border-top: #eee 1px solid;
  padding-top: 1.2rem;
  margin-top: 1.2rem;
  color: #666;
`;

const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
`;

const Header = styled.div`
  padding: 0 25px 0;
  display: flex;
  margin: 25px 0;
  align-items: flex-start;
  /* justify-content: space-between; */
`;
