import React, { useState } from "react";
import { Col, Row } from "reactstrap";
import styled from "styled-components";

import { YOUNG_PHASE, YOUNG_STATUS_PHASE3 } from "snu-lib";
import SelectStatus from "../../../components/selectStatus";
import DownloadAttestationButton from "../../../components/buttons/DownloadAttestationButton";
import { Box, BoxTitle } from "../../../components/box";
import PanelActionButton from "../../../components/buttons/PanelActionButton";
import { toastr } from "react-redux-toastr";
import api from "../../../services/api";
import YoungHeader from "../../phase0/components/YoungHeader";

export default function Phase3({ young, onChange }) {
  const [edit, setEdit] = useState(false);
  const [information, setInformation] = useState({
    phase3StructureName: young.phase3StructureName,
    phase3MissionDescription: young.phase3MissionDescription,
    phase3TutorFirstName: young.phase3TutorFirstName,
    phase3TutorLastName: young.phase3TutorLastName,
    phase3TutorEmail: young.phase3TutorEmail,
    phase3TutorPhone: young.phase3TutorPhone,
  });

  // eslint-disable-next-line no-unused-vars
  const getText = () => {
    if (young.statusPhase3 === YOUNG_STATUS_PHASE3.WAITING_VALIDATION) return "Le tuteur n'a pas encore validé la mission";
    if (young.statusPhase3 === YOUNG_STATUS_PHASE3.VALIDATED) return "Le tuteur a validé la mission";
  };

  const handleChange = (e) => {
    setInformation({ ...information, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { ok } = await api.put(`/young/update_phase3/${young._id}`, information);
      if (!ok) toastr.error("Oups, une erreur est survenue !");
      else {
        toastr.success("Mis à jour!");
        setEdit(false);
        onChange();
      }
    } catch (e) {
      console.log(e);
      setEdit(false);
      return toastr.error("Oups, une erreur est survenue lors du changement de l'information de la phase 3");
    }
  };

  return (
    <>
      <YoungHeader young={young} tab="phase3" onChange={onChange} />
      <div className="p-[30px]">
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
                  <div className="border"></div>
                  <Col className="flex ">
                    <BoxTitle>Tuteur</BoxTitle>
                    <div className="mr-2">
                      {edit ? (
                        <PanelActionButton icon="close" title="Annuler" onClick={() => setEdit(!edit)} />
                      ) : (
                        <PanelActionButton icon="pencil" title="Modifier" onClick={() => setEdit(!edit)} />
                      )}
                    </div>
                  </Col>
                </Row>
                <Row className="pl-8 pb-2">
                  <Col>
                    <Details
                      title="Structure"
                      value={young.phase3StructureName}
                      valueEdit={information.phase3StructureName}
                      edit={edit}
                      name={"phase3StructureName"}
                      onChange={handleChange}
                    />
                    <Details
                      title="Descriptif"
                      value={young.phase3MissionDescription}
                      valueEdit={information.phase3MissionDescription}
                      edit={edit}
                      name={"phase3MissionDescription"}
                      onChange={handleChange}
                    />
                  </Col>
                  <div className="border"></div>
                  <Col>
                    <Details
                      title="Prénom"
                      value={young.phase3TutorFirstName}
                      valueEdit={information.phase3TutorFirstName}
                      edit={edit}
                      name={"phase3TutorFirstName"}
                      onChange={handleChange}
                    />
                    <Details
                      title="Nom"
                      value={young.phase3TutorLastName}
                      valueEdit={information.phase3TutorLastName}
                      edit={edit}
                      name={"phase3TutorLastName"}
                      onChange={handleChange}
                    />
                    <Details title="E-mail" value={young.phase3TutorEmail} valueEdit={information.phase3TutorEmail} edit={edit} name={"phase3TutorEmail"} onChange={handleChange} />
                    <Details
                      title="Téléphone"
                      value={young.phase3TutorPhone}
                      valueEdit={information.phase3TutorPhone}
                      edit={edit}
                      name={"phase3TutorPhone"}
                      onChange={handleChange}
                    />
                  </Col>
                </Row>
                <Row className="flex justify-center pb-2">
                  <div className="ml-4 h-10">{edit ? <PanelActionButton icon="pencil" title="Valider" type="submit" /> : null}</div>
                </Row>
              </form>
            </Box>
          </>
        ) : null}
      </div>
    </>
  );
}

const Details = ({ title, value, valueEdit, edit, onChange, name }) => {
  if (typeof value === "function") value = value();
  return (
    <div className="flex h-12 items-center p-2 ">
      <div className="w-1/4 text-brand-detail_title ">{title} : </div>
      {edit ? (
        <input type="text" required value={valueEdit} name={name} className="mr-4 h-8 w-3/4 rounded border pl-1" onChange={onChange} />
      ) : (
        <div className="mr-2 w-3/4">{value}</div>
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
