import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import styled from "styled-components";
import { Col, Row, Spinner } from "reactstrap";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import api from "../../../services/api";
import SelectStatusMission from "../../../components/selectStatusMission";
import { translate, ROLES, MISSION_STATUS } from "../../../utils";
import TabList from "../../../components/views/TabList";
import Tab from "../../../components/views/Tab";
import PanelActionButton from "../../../components/buttons/PanelActionButton";
import Badge from "../../../components/Badge";
import Title from "../../../components/views/Title";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import ExclamationCircle from "../../../assets/icons/ExclamationCircle";

import Bin from "../../../assets/Bin";
import Field from "../components/Field";

export default function Wrapper({ mission, tab, children }) {
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  const onClickDelete = () => {
    setModal({ isOpen: true, onConfirm: onConfirmDelete, title: "Êtes-vous sûr(e) de vouloir supprimer cette mission ?", message: "Cette action est irréversible." });
  };

  const onConfirmDelete = async () => {
    try {
      const { ok, code } = await api.remove(`/mission/${mission._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok && code === "LINKED_OBJECT")
        return toastr.error("Vous ne pouvez pas supprimer cette mission car des candidatures sont encore liées à cette mission.", { timeOut: 5000 });
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Cette mission a été supprimée.");
      return history.push(`/mission`);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression de la mission :", translate(e.code));
    }
  };

  const onClickDuplicate = () => {
    setModal({ isOpen: true, onConfirm: onConfirmDuplicate, title: "Êtes-vous sûr(e) de vouloir dupliquer cette mission ?" });
  };

  const onConfirmDuplicate = async () => {
    mission.name += " (copie)";
    delete mission._id;
    mission.placesLeft = mission.placesTotal;
    mission.status = MISSION_STATUS.DRAFT;
    const { data, ok, code } = await api.post("/mission", mission);
    if (!ok) toastr.error("Oups, une erreur est survnue lors de la duplication de la mission", translate(code));
    toastr.success("Mission dupliquée !");
    return history.push(`/mission/${data._id}`);
  };

  if (!mission) return null;
  return (
    <div style={{ flex: tab === "missions" ? "0%" : 2, position: "relative" }}>
      <div className=" flex flex-row border-b border-gray-200 my-7 px-8 gap-4 justify-between">
        <div className="flex flex-col justify-end">
          <div className="text-2xl font-bold mb-7 ">
            {mission.name} {mission.isMilitaryPreparation === "true" ? <Badge text="Préparation Militaire" /> : null}
          </div>
          <div className="flex flex-row gap-8">
            <div
              className={`cursor-pointer text-gray-400 text-sm ${tab === "details" && "text-blue-600 border-b-2 border-blue-600 pb-4"}`}
              onClick={() => history.push(`/mission/${mission._id}`)}>
              Détails
            </div>
            {/* TODO: point d'exclamation si candidatures en attente */}
            <div
              className={`cursor-pointer text-gray-400 text-sm ${tab === "youngs" && "text-blue-600 border-b-2 border-blue-600 pb-4"}`}
              onClick={() => history.push(`/mission/${mission._id}/youngs`)}>
              Candidatures
            </div>
            {[ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role) ? (
              mission.visibility === "HIDDEN" || mission.pendingApplications >= mission.placesLeft * 5 || mission.placesLeft < 1 ? (
                <div className={`cursor-pointer text-gray-400 text-sm ${tab === "propose-mission" && "text-blue-600 border-b-2 border-blue-600 pb-4"}`} disabled>
                  Proposer cette mission
                </div>
              ) : (
                <div
                  className={`cursor-pointer text-gray-400 text-sm ${tab === "propose-mission" && "text-blue-600 border-b-2 border-blue-600 pb-4"}`}
                  onClick={() => history.push(`/mission/${mission._id}/propose-mission`)}>
                  Proposer cette mission
                </div>
              )
            ) : null}
            {[ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role) ? (
              <div
                className={`cursor-pointer text-gray-400 text-sm ${tab === "historique" && "text-blue-600 border-b-2 border-blue-600 pb-4"}`}
                onClick={() => history.push(`/mission/${mission._id}/historique`)}>
                <div className="flex flex-row items-center justify-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M8.99496 0.820299C6.24748 0.820299 3.8206 2.17079 2.3346 4.24002V2.86353C2.3346 2.44034 1.99052 2.09732 1.5661 2.09732C1.14169 2.09732 0.797607 2.44035 0.797607 2.86353V5.92838C0.797607 6.35147 1.14169 6.69459 1.5661 6.69459H4.89625C5.32066 6.69459 5.66474 6.35149 5.66474 5.92838C5.66474 5.50518 5.32066 5.16216 4.89625 5.16216H3.55949C4.76517 3.46318 6.74864 2.35274 8.99497 2.35274C12.6733 2.35274 15.6552 5.32581 15.6552 8.99323C15.6552 12.6606 12.6733 15.6337 8.99497 15.6337C5.89466 15.6337 3.29681 13.5187 2.55439 10.659L2.54105 10.6632C2.43751 10.3622 2.15936 10.1425 1.82225 10.1425C1.39784 10.1425 1.05376 10.4855 1.05376 10.9086C1.05376 10.9841 1.07649 11.0525 1.09685 11.1214L1.08885 11.1239C1.0939 11.1425 1.10315 11.1591 1.1083 11.1775C1.11395 11.1924 1.1177 11.2073 1.12424 11.2217C2.09935 14.6489 5.24513 17.1661 8.99502 17.1661C13.5223 17.1661 17.1923 13.507 17.1923 8.99322C17.1922 4.4794 13.5222 0.820282 8.99496 0.820282V0.820299ZM8.99496 4.26819C8.57054 4.26819 8.22646 4.61122 8.22646 5.0344V9.63166C8.22646 10.0549 8.57054 10.3979 8.99496 10.3979H12.3251C12.7495 10.3979 13.0936 10.0548 13.0936 9.63175C13.0936 9.20848 12.7495 8.86554 12.3251 8.86554H9.76345V5.0344C9.76345 4.6112 9.41935 4.26819 8.99494 4.26819H8.99496Z"
                      fill={`${tab === "historique" ? "#2563EB" : "#6B7280"} `}
                    />
                  </svg>
                  Historique
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="flex flex-row justify-center items-center gap-4">
          <div className="flex flex-col text-right">
            <div className="font-bold text-3xl">{mission.placesLeft}</div>
            <div className="uppercase text-gray-500 text-xs">
              {mission.placesLeft > 1 ? (
                <>
                  <div>places</div>
                  <div>restantes</div>
                </>
              ) : (
                <>
                  <div>place</div>
                  <div>restante</div>
                </>
              )}
            </div>
            <div className="flex flex-row justify-end">
              <div className="text-gray-500">sur</div>
              <div>&nbsp;{mission.placesTotal}</div>
            </div>
          </div>
          <div className="flex flex-col">
            <SelectStatusMission hit={mission} />
            <div className="flex items-center justify-between my-[15px]">
              <Button icon={<Bin fill="red" />} onClick={onClickDelete}>
                Supprimer
              </Button>
              <Button className="ml-[8px]" onClick={onClickDuplicate}>
                Dupliquer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 
      <Header>
        <div style={{ flex: 1 }}>
          <Title>
            {mission.name} {mission.isMilitaryPreparation === "true" ? <Badge text="Préparation Militaire" /> : null}
          </Title>
          <TabList>
            <Tab isActive={tab === "details"} onClick={() => history.push(`/mission/${mission._id}`)}>
              Détails
            </Tab>
            <Tab isActive={tab === "youngs"} onClick={() => history.push(`/mission/${mission._id}/youngs`)}>
              <div className="flex items-center flex-nowrap">
                {mission.pendingApplications >= mission.placesLeft * 5 && mission.placesLeft > 0 && <ExclamationCircle className="text-red-600 mr-2" />}
                <span>Candidatures</span>
              </div>
            </Tab>
            {[ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role) ? (
              mission.visibility === "HIDDEN" || mission.pendingApplications >= mission.placesLeft * 5 || mission.placesLeft < 1 ? (
                <Tab isActive={tab === "propose-mission"} disabled>
                  Proposer cette mission
                </Tab>
              ) : (
                <Tab isActive={tab === "propose-mission"} onClick={() => history.push(`/mission/${mission._id}/propose-mission`)}>
                  Proposer cette mission
                </Tab>
              )
            ) : null}
            {[ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role) ? (
              <Tab isActive={tab === "historique"} onClick={() => history.push(`/mission/${mission._id}/historique`)}>
                Historique
              </Tab>
            ) : null}
          </TabList>
        </div>
        <Row style={{ minWidth: "30%" }}>
          <Col md={4}>
            <BoxPlaces>
              <table>
                <tbody>
                  <tr>
                    <td style={{ fontSize: "2.5rem", paddingRight: "10px" }}>{mission.placesLeft}</td>
                    <td>
                      <b>Places restantes</b>
                      <br />
                      <span style={{ color: "#999" }}>
                        {mission.placesTotal - mission.placesLeft} / {mission.placesTotal}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </BoxPlaces>
          </Col>
          <Col md={8}>
            <Row>
              <Col md={12} style={{ display: "flex", justifyContent: "flex-end", minHeight: "35px" }}>
                <SelectStatusMission hit={mission} />
              </Col>
            </Row>
            <Row style={{ marginTop: "0.5rem" }}>
              <Link to={`/mission/${mission._id}/edit`}>
                <PanelActionButton title="Modifier" icon="pencil" />
              </Link>
              <PanelActionButton onClick={onClickDuplicate} title="Dupliquer" icon="duplicate" />
              <PanelActionButton onClick={onClickDelete} title="Supprimer" icon="bin" />
            </Row>
          </Col>
        </Row>
      </Header>
      */}

      {children}
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onCancel={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </div>
  );
}

const Header = styled.div`
  padding: 0 25px 0;
  display: flex;
  margin: 2rem 0 1rem 0;
  align-items: flex-start;
`;

const Box = styled.div`
  width: ${(props) => props.width || 100}%;
  height: 100%;
  background-color: #fff;
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.05));
  border-radius: 8px;
`;

const BoxPlaces = styled(Box)`
  padding: 0 1rem;
  display: flex;
  align-items: center;
  h1 {
    font-size: 3rem;
    margin: 0;
  }
  p {
    margin-left: 1rem;
    font-size: 0.8rem;
    color: black;
    &.places {
      color: #777;
    }
  }
`;

function Button({ children, className = "", onClick = () => {}, spinner = false, icon, href, target, rel }) {
  if (href) {
    return (
      <a
        className={`inline-flex items-center justify-center whitespace-nowrap px-3 py-2 cursor-pointer bg-[#FFFFFF] text-[#1F2937] border-[transparent] border-[1px] border-solid rounded-[6px] hover:border-[#D1D5DB] ${className}`}
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}>
        {icon && <icon.type {...icon.props} className={`mr-[8px] ${icon.props.className}`} />}
        {children}
      </a>
    );
  } else {
    return (
      <button
        className={`flex items-center justify-center whitespace-nowrap px-3 py-2 cursor-pointer bg-[#FFFFFF] text-[#1F2937] border-[transparent] border-[1px] border-solid rounded-[6px] hover:border-[#D1D5DB] ${className}`}
        onClick={onClick}>
        {spinner && <Spinner size="sm" style={{ borderWidth: "0.1em", marginRight: "0.5rem" }} />}
        {icon && <icon.type {...icon.props} className={`mr-[8px] ${icon.props.className}`} />}
        {children}
      </button>
    );
  }
}
