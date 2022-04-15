import React, { useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";

import { YOUNG_PHASE, YOUNG_STATUS_PHASE3 } from "../../../utils";
import WrapperPhase3 from "./wrapper";
import SelectStatus from "../../../components/selectStatus";
import DownloadAttestationButton from "../../../components/buttons/DownloadAttestationButton";
import { Box, BoxTitle } from "../../../components/box";
import PanelActionButton from "../../../components/buttons/PanelActionButton";

export default function Phase3({ young, onChange }) {

  const [edit, setEdit] = useState(false)
  const [information, setInformation] = useState({
    newStructureName: young.phase3StructureName,
    newMissionDescription: young.phase3MissionDescription,
    newTutorFirstName: young.phase3TutorFirstName,
    newTutorLastName: young.phase3TutorLastName,
    newTutorEmail: young.phase3TutorEmail,
    newTutorPhone: young.phase3TutorPhone,
  })

  const getText = () => {
    if (young.statusPhase3 === YOUNG_STATUS_PHASE3.WAITING_VALIDATION) return "Le tuteur n'a pas encore validé la mission";
    if (young.statusPhase3 === YOUNG_STATUS_PHASE3.VALIDATED) return "Le tuteur a validé la mission";
  };

  const handleSubmit = () => {
    console.log("submit")
  }

  return (
    <div style={{ display: "flex", alignItems: "flex-start", width: "100%" }}>
      <WrapperPhase3 young={young} tab="phase3" onChange={onChange}>
        <Box>
          <Bloc title="Réalisation d'une nouvelle mission d'intérêt général">
            <div style={{ display: "flex" }}>
              <p style={{ flex: 1 }}>Le volontaire doit réaliser sa phase 3 avant ses 25 ans.</p>
              {young.statusPhase3 ? (
                <SelectStatus
                  hit={young}
                  statusName="statusPhase3"
                  phase={YOUNG_PHASE.CONTINUE}
                  options={Object.keys(YOUNG_STATUS_PHASE3).filter((e) => e !== YOUNG_STATUS_PHASE3.WITHDRAWN)}
                />
              ) : null}
            </div>
          </Bloc>
        </Box>
        {young.statusPhase3 !== YOUNG_STATUS_PHASE3.WAITING_REALISATION ? (
          <>
            <Box>
              <form onSubmit={handleSubmit}>
                <Row className="pl-8 pt-10  ">
                  <Col>
                    <BoxTitle>Mission de phase 3 réalisée</BoxTitle>
                  </Col>
                  <Col className="flex">
                    <BoxTitle>Tuteur</BoxTitle>
                  </Col>
                </Row>
                <Row className="pl-8 pb-2">
                  <Col>
                    <Details title="Structure" value={young.phase3StructureName} edit={edit} name={"newStructureName"} information={information} setInformation={setInformation} />
                    <Details title="Descriptif" value={young.phase3MissionDescription} edit={edit} name={"MissionDescription"} information={information} setInformation={setInformation} />
                  </Col>
                  <Col>
                    <Details title="Prénom" value={young.phase3TutorFirstName} edit={edit} name={"TutorFirstName"} information={information} setInformation={setInformation} />
                    <Details title="Nom" value={young.phase3TutorLastName} edit={edit} name={"TutorLastName"} information={information} setInformation={setInformation} />
                    <Details title="E-mail" value={young.phase3TutorEmail} edit={edit} name={"TutorEmail"} information={information} setInformation={setInformation} />
                    <Details title="Téléphone" value={young.phase3TutorPhone} edit={edit} name={"TutorPhone"} information={information} setInformation={setInformation} />
                  </Col>
                </Row>
                <Row className="pb-2 flex justify-center">
                  {edit ? (
                    <>
                      <input type="submit" value="Envoyer" />
                      {/* <PanelActionButton icon="close" title="Annuler" /> */}
                      <div className="border" onClick={() => setEdit(!edit)}> Annuler </div>
                    </>
                  ) : (
                    //<PanelActionButton icon="pencil" title="Modifier"/>
                    <div className="border" onClick={() => setEdit(!edit)}> Modifier </div>
                  )}
                </Row>
              </form>
            </Box>
          </>
        ) : null}
        {young.statusPhase3 === "VALIDATED" ? (
          <DownloadAttestationButton young={young} uri="3">
            Télécharger l&apos;attestation de réalisation de la phase 3
          </DownloadAttestationButton>
        ) : null}
      </WrapperPhase3>
    </div>
  );
}

const Details = ({ title, value, edit, name, information, setInformation }) => {
  if (!value) return <div />;
  if (typeof value === "function") value = value();
  return (
    <div className="flex p-2 items-center h-10">
      <div className="w-1/4 ">{title}</div>
      {edit ? (
        <input type="text" placeholder={value} name={name} className="w-3/4 bg-brand-extraLightGrey rounded border mr-2" />
      ) : (
        <div className="w-3/4 mr-2">{value}</div>
      )}

    </div>
  );
};

const Bloc = ({ children, title, borderBottom, borderRight, borderLeft, disabled }) => {
  return (
    <Row
      style={{
        borderBottom: borderBottom ? "2px solid #f4f5f7" : 0,
        borderRight: borderRight ? "2px solid #f4f5f7" : 0,
        borderLeft: borderLeft ? "2px solid #f4f5f7" : 0,
        backgroundColor: disabled ? "#f9f9f9" : "transparent",
      }}>
      <Wrapper>
        <div style={{ display: "flex" }}>
          <BoxTitle>{title}</BoxTitle>
        </div>
        {children}
      </Wrapper>
    </Row>
  );
};

const Wrapper = styled.div`
  padding: 3rem;
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
