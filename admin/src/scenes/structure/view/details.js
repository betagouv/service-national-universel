import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { Link } from "react-router-dom";

import { translate } from "../../../utils";
import StructureView from "./wrapper";
import api from "../../../services/api";
import Avatar from "../../../components/Avatar";
import SocialIcons from "../../../components/SocialIcons";

export default ({ ...props }) => {
  const [structure, setStructure] = useState();
  const [referents, setReferents] = useState([]);
  const [parentStructure, setParentStructure] = useState(null);

  useEffect(() => {
    (async () => {
      const id = props.match && props.match.params && props.match.params.id;
      if (!id) return <div />;
      const { data } = await api.get(`/structure/${id}`);
      setStructure(data);
    })();
  }, []);

  useEffect(() => {
    if (!structure) return;
    (async () => {
      const queries = [];
      queries.push({ index: "referent", type: "_doc" });
      queries.push({
        query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": structure._id } }] } },
      });
      if (structure.networkId) {
        queries.push({ index: "structure", type: "_doc" });
        queries.push({
          query: { bool: { must: { match_all: {} }, filter: [{ term: { _id: structure.networkId } }] } },
        });
      }

      const { responses } = await api.esQuery(queries);
      if (structure.networkId) {
        const structures = responses[1]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
        setParentStructure(structures.length ? structures[0] : null);
      } else {
        setParentStructure(null);
      }
      setReferents(responses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })));
    })();
  }, [structure]);

  if (!structure) return <div />;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <StructureView structure={structure} tab="details">
        <Box>
          <Row>
            <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
              <Wrapper>
                <div style={{ display: "flex" }}>
                  <Legend>La structure</Legend>
                  <div style={{ marginLeft: "auto" }}>
                    <SocialIcons value={structure} />
                  </div>
                </div>

                <div className="detail">
                  <div className="detail-title">Présentation</div>
                  <div className="detail-text">{structure.description}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Status</div>
                  <div className="detail-text">{translate(structure.legalStatus)}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Région</div>
                  <div className="detail-text">{structure.region}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Dép.</div>
                  <div className="detail-text">{structure.department}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Ville</div>
                  <div className="detail-text">{structure.city}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Adresse</div>
                  <div className="detail-text">{structure.address}</div>
                </div>
                <div className="detail">
                  <div className="detail-title">Siret</div>
                  <div className="detail-text">{structure.siret}</div>
                </div>
                {parentStructure ? (
                  <div className="detail">
                    <div className="detail-title">Réseau national</div>
                    <div className="detail-text">
                      <TagParent>{parentStructure.name}</TagParent>
                    </div>
                  </div>
                ) : null}
                <div className="detail">
                  <div className="detail-title">Tête de réseau</div>
                  <div className="detail-text">{structure.isNetwork === "true" ? "Cette structure est une tête de réseau" : "Cette structure n'est pas une tête de réseau"}</div>
                </div>
              </Wrapper>
            </Col>
            <Col md={6}>
              <Wrapper>
                <Legend>{`Équipe (${referents.length})`}</Legend>
                {referents.length ? null : <i>Aucun compte n'est associé à cette structure.</i>}
                {referents.map((referent, k) => (
                  <Link to={`/user/${referent._id}`}>
                    <div style={{ display: "flex", alignItems: "center", marginTop: "1rem" }} key={k}>
                      <Avatar name={`${referent.firstName} ${referent.lastName}`} />
                      <div>{`${referent.firstName} ${referent.lastName}`}</div>
                    </div>
                  </Link>
                ))}
              </Wrapper>
            </Col>
          </Row>
        </Box>
      </StructureView>
    </div>
  );
};

const Wrapper = styled.div`
  padding: 3rem;
  .detail {
    display: flex;
    align-items: flex-start;
    font-size: 14px;
    text-align: left;
    margin-top: 1rem;
    &-title {
      min-width: 90px;
      width: 90px;
      margin-right: 1rem;
      color: #798399;
    }
    &-text {
      color: rgba(26, 32, 44);
    }
  }
`;

const Legend = styled.div`
  color: rgb(38, 42, 62);
  margin-bottom: 20px;
  font-size: 1.3rem;
  font-weight: 500;
`;

const Box = styled.div`
  width: ${(props) => props.width || 100}%;
  height: 100%;
  background-color: #fff;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  margin-bottom: 33px;
  border-radius: 8px;
`;

const Tag = styled.span`
  align-self: flex-start;
  border-radius: 4px;
  padding: 0.25rem 0.5rem;
  font-size: 13px;
  white-space: nowrap;
  font-weight: 400;
  cursor: pointer;
  margin-right: 5px;
`;

const TagParent = styled(Tag)`
  color: #5245cc;
  background: rgba(82, 69, 204, 0.1);
  border: 0.5px solid #5245cc;
`;
