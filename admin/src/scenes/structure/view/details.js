import React, { useEffect, useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import { translate, ES_NO_LIMIT, ROLES } from "../../../utils";
import StructureView from "./wrapper";
import api from "../../../services/api";
import Avatar from "../../../components/Avatar";
import SocialIcons from "../../../components/SocialIcons";
import Invite from "../components/invite";
import { Box, BoxTitle } from "../../../components/box";
import Badge from "../../../components/Badge";

export default ({ structure }) => {
  const [referents, setReferents] = useState([]);
  const [parentStructure, setParentStructure] = useState(null);
  const user = useSelector((state) => state.Auth.user);

  const getReferents = async () => {
    if (!structure) return;
    const { responses: referentResponses } = await api.esQuery("referent", {
      query: { bool: { must: { match_all: {} }, filter: [{ term: { "structureId.keyword": structure._id } }] } },
      size: ES_NO_LIMIT,
    });
    if (structure.networkId) {
      const { responses: structureResponses } = await api.esQuery("structure", { query: { bool: { must: { match_all: {} }, filter: [{ term: { _id: structure.networkId } }] } } });

      const structures = structureResponses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source }));
      setParentStructure(structures.length ? structures[0] : null);
    } else {
      setParentStructure(null);
    }
    setReferents(referentResponses[0]?.hits?.hits.map((e) => ({ _id: e._id, ...e._source })));
  };

  useEffect(() => {
    getReferents();
  }, [structure]);

  if (!structure) return <div />;

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <StructureView structure={structure} tab="details">
        <Box>
          <Row>
            <Col md={6} style={{ borderRight: "2px solid #f4f5f7" }}>
              <Bloc title="La structure" titleRight={<SocialIcons value={structure} />}>
                <Details title="Présentation" value={structure.description} />
                <Details title="Status" value={translate(structure.legalStatus)} />
                <Details title="Adresse" value={structure.address} />
                <Details title="Ville" value={structure.city} />
                <Details title="Code Postal" value={structure.zip} />
                <Details title="Dép." value={structure.department} />
                <Details title="Région" value={structure.region} />
                {user.role === ROLES.ADMIN && structure.location?.lat && structure.location?.lon ? (
                  <Details title="GPS" value={`${structure.location?.lat} , ${structure.location?.lon}`} copy />
                ) : null}
                <Details title="Siret" value={structure.siret} />
                {parentStructure ? <Details title="Réseau national" value={<Badge text={parentStructure.name} color="#5245cc" />} /> : null}
                <Details
                  title="Tête de réseau"
                  value={structure.isNetwork === "true" ? "Cette structure est une tête de réseau" : "Cette structure n'est pas une tête de réseau"}
                />
              </Bloc>
            </Col>
            <Col md={6}>
              <Row style={{ borderBottom: "2px solid #f4f5f7" }}>
                <Wrapper>
                  <BoxTitle>{`Équipe (${referents.length})`}</BoxTitle>
                  {referents.length ? null : <i>Aucun compte n'est associé à cette structure.</i>}
                  {referents.map((referent) => (
                    <Link to={`/user/${referent._id}`} key={referent._id}>
                      <div style={{ display: "flex", alignItems: "center", marginTop: "1rem" }} key={referent._id}>
                        <Avatar name={`${referent.firstName} ${referent.lastName}`} />
                        <div>{`${referent.firstName} ${referent.lastName}`}</div>
                      </div>
                    </Link>
                  ))}
                </Wrapper>
              </Row>
              <Invite structure={structure} onSent={getReferents} />
            </Col>
          </Row>
        </Box>
      </StructureView>
    </div>
  );
};

const Bloc = ({ children, title, titleRight, borderBottom, borderRight, borderTop, disabled }) => {
  return (
    <Row
      style={{
        width: "100%",
        borderTop: borderTop ? "2px solid #f4f5f7" : 0,
        borderBottom: borderBottom ? "2px solid #f4f5f7" : 0,
        borderRight: borderRight ? "2px solid #f4f5f7" : 0,
        backgroundColor: disabled ? "#f9f9f9" : "transparent",
      }}
    >
      <Wrapper
        style={{
          width: "100%",
        }}
      >
        <div style={{ display: "flex", width: "100%" }}>
          <BoxTitle>
            <div>{title}</div>
            <div>{titleRight}</div>
          </BoxTitle>
        </div>
        {children}
      </Wrapper>
    </Row>
  );
};

const Details = ({ title, value, copy }) => {
  console.log(copy);
  if (!value) return <div />;
  if (typeof value === "function") value = value();
  return (
    <div className="detail">
      <div className="detail-title">{`${title} :`}</div>
      <div className="detail-text">{value}</div>
      {copy ? (
        <div
          className="icon"
          onClick={() => {
            navigator.clipboard.writeText(value);
            toastr.success(`'${title}' a été copié dans le presse papier.`);
          }}
        />
      ) : null}
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
      white-space: pre-line;
    }
  }
  .icon {
    cursor: pointer;
    margin: 0 0.5rem;
    width: 15px;
    height: 15px;
    background: ${`url(${require("../../../assets/copy.svg")})`};
    background-repeat: no-repeat;
    background-position: center;
    background-size: 15px 15px;
  }
`;
