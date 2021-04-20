import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { toastr } from "react-redux-toastr";

import api from "../../services/api";
import LoadingButton from "../../components/buttons/LoadingButton";
import Loader from "../../components/Loader";
import PlusSVG from "../../assets/plus.svg";
import CrossSVG from "../../assets/cross.svg";
import { region2department, departmentList, department2region } from "../../utils/region-and-departments";

export default () => {
  const [inscriptionGoals, setInscriptionGoals] = useState();
  const [loading, setLoading] = useState(false);
  const [blocsOpened, setBlocsOpened] = useState([]);

  const getInscriptionGoals = async () => {
    const { data, ok, code } = await api.get("/inscription-goal");
    if (!ok) return toastr.error("nope");
    setInscriptionGoals(departmentList.map((d) => data.find((e) => e.department === d) || { department: d, region: department2region[d], max: null }));
  };
  useEffect(() => {
    getInscriptionGoals();
  }, []);

  if (!inscriptionGoals) return <Loader />;

  return (
    <>
      <Header>
        <div style={{ flex: 1 }}>
          <Title>Objectifs d'inscriptions au SNU 2021</Title>
        </div>
        <LoadingButton
          loading={loading}
          onClick={async () => {
            setLoading(true);
            await api.post("/inscription-goal", inscriptionGoals);
            setLoading(false);
          }}
        >
          Enregistrer
        </LoadingButton>
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
              }}
            >
              {departements.map((department) => {
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
                                const val = e.target.value && !isNaN(Number(e.target.value)) ? Number(e.target.value) : "";
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
                      <Col md={4} style={{ textAlign: "right", alignSelf: "center" }}>
                        … déjà inscrits
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
};

const Departement = styled.div`
  border-top: #eee 1px solid;
  padding-top: 1.2rem;
  margin-top: 1.2rem;
  color: #666;
`;

const ToggleBloc = ({ children, title, borderBottom, borderRight, borderLeft, disabled, onClick, visible }) => {
  return (
    <Row
      style={{
        borderBottom: borderBottom ? "2px solid #f4f5f7" : 0,
        borderRight: borderRight ? "2px solid #f4f5f7" : 0,
        borderLeft: borderLeft ? "2px solid #f4f5f7" : 0,
        backgroundColor: disabled ? "#f9f9f9" : "transparent",
      }}
    >
      <Wrapper>
        <div onClick={onClick} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer" }}>
          <Legend>{title}</Legend>
          <div>
            <Icon src={visible ? CrossSVG : PlusSVG} />
          </div>
        </div>
        <div style={{ display: visible ? "block" : "none" }}>{children}</div>
      </Wrapper>
    </Row>
  );
};

const Wrapper = styled.div`
  padding: 2rem;
  margin-bottom: 1rem;
  border-radius: 5px;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  background-color: white;
  width: 100%;
  .detail {
    display: flex;
    align-items: flex-start;
    font-size: 14px;
    text-align: left;
    margin-top: 1rem;
    &-title {
      color: #798399;
    }
    &-text {
      color: rgba(26, 32, 44);
    }
  }
  p {
    font-size: 13px;
    color: #798399;
    margin-top: 1rem;
  }
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

const Legend = styled.div`
  color: rgb(38, 42, 62);
  font-size: 1.3rem;
  font-weight: 500;
`;

const Icon = styled.img`
  height: 18px;
  font-size: 18px;
  cursor: pointer;
`;
