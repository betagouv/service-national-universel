import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import styled from "styled-components";
import { Col, Row } from "reactstrap";
import api from "../../../services/api";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";
import { DropdownItem, DropdownMenu, DropdownToggle, UncontrolledDropdown } from "reactstrap";

import { translate, YOUNG_STATUS, ROLES, colors, translateCohort } from "../../../utils";
import SelectStatus from "../../../components/selectStatus";
import Badge from "../../../components/Badge";
import PanelActionButton from "../../../components/buttons/PanelActionButton";
import TabList from "../../../components/views/TabList";
import Tab from "../../../components/views/Tab";
import Title from "../../../components/views/Title";
import { appURL } from "../../../config";
import ModalConfirm from "../../../components/modals/ModalConfirm";
import ModalConfirmWithMessage from "../../../components/modals/ModalConfirmWithMessage";
import ActionButtonArchive from "../../../components/buttons/ActionButtonArchive";
import plausibleEvent from "../../../services/pausible";
import Chevron from "../../../components/Chevron";

export default function Wrapper({ children, young, tab, onChange }) {
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const onClickDelete = () => {
    setModal({
      isOpen: true,
      onConfirm: onConfirmDelete,
      title: "Êtes-vous sûr(e) de vouloir supprimer ce volontaire ?",
      message: "Cette action est irréversible.",
    });
  };

  const onConfirmDelete = async () => {
    try {
      const { ok, code } = await api.remove(`/young/${young._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Ce volontaire a été supprimé.");
      return history.push(`/volontaire`);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression du volontaire :", translate(e.code));
    }
  };

  if (!young) return null;
  return (
    <div style={{ flex: tab === "missions" ? "0%" : 2, position: "relative", padding: "3rem" }}>
      <Header>
        <div style={{ flex: 1 }}>
          <Title>
            {young.firstName} {young.lastName} <BadgeCohort young={young} onChange={onChange} />
          </Title>
          <TabList>
            <Tab isActive={tab === "details"} onClick={() => history.push(`/volontaire/${young._id}`)}>
              Détails
            </Tab>
            <Tab isActive={tab === "phase1"} onClick={() => history.push(`/volontaire/${young._id}/phase1`)}>
              Phase 1
            </Tab>
            <Tab isActive={tab === "phase2"} onClick={() => history.push(`/volontaire/${young._id}/phase2`)}>
              Phase 2
            </Tab>
            <Tab isActive={tab === "phase3"} onClick={() => history.push(`/volontaire/${young._id}/phase3`)}>
              Phase 3
            </Tab>
            {user.role === ROLES.ADMIN ? (
              <Tab isActive={tab === "historique"} onClick={() => history.push(`/volontaire/${young._id}/historique`)}>
                Historique <i style={{ color: colors.purple, fontWeight: "lighter", fontSize: ".85rem" }}>Bêta</i>
              </Tab>
            ) : null}
          </TabList>
        </div>
        <Row style={{ minWidth: "30%" }}>
          <Col md={12}>
            <Row>
              <Col md={12} style={{ display: "flex", justifyContent: "flex-end" }}>
                <SelectStatus hit={young} options={[YOUNG_STATUS.VALIDATED, YOUNG_STATUS.WITHDRAWN]} />
              </Col>
            </Row>
            <Row style={{ marginTop: "0.5rem" }}>
              <a href={`${appURL}/auth/connect?token=${api.getToken()}&young_id=${young._id}`} onClick={() => plausibleEvent("Volontaires/CTA - Prendre sa place")}>
                <PanelActionButton icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" />
              </a>
              <Link to={`/volontaire/${young._id}/edit`} onClick={() => plausibleEvent("Volontaires/CTA - Modifier profil volontaire")}>
                <PanelActionButton icon="pencil" title="Modifier" />
              </Link>
              <PanelActionButton onClick={onClickDelete} icon="bin" title="Supprimer" />
              {user.role === ROLES.ADMIN ? <ActionButtonArchive young={young} /> : null}
            </Row>
          </Col>
        </Row>
      </Header>
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

const BadgeCohort = ({ young, onChange }) => {
  const [modalConfirm, setModalConfirm] = useState(false);
  const [modalConfirmWithMessage, setModalConfirmWithMessage] = useState(false);
  const [disableConfirm, setDisableConfirm] = useState(false);
  const [newCohort, setNewCohort] = useState(young.cohort);
  const [motif, setMotif] = useState("");
  console.log(motif, !motif);

  const motifs = [
    "Non disponibilité pour motif familial ou personnel",
    "Non disponibilité pour motif scolaire ou professionnel",
    "L’affectation ne convient pas",
    "Impossibilité de se rendre au point de rassemblement",
    "Autre",
  ];

  const defaultInput = `[Zone de texte : Renseignez la raison du changement de cohorte]`;

  const handleChangeCohort = async (messageTextArea) => {
    try {
      await api.put(`/referent/young/${young._id}`, { cohort: newCohort });
      //! TODO : Ajouter le template
      // await api.post(`/young/${young._id}/email/${SENDINBLUE_TEMPLATES.young.INSCRIPTION_VALIDATED}`);}
      await onChange();
      toastr.success("Cohorte modifiée avec succès");
      setModalConfirmWithMessage(false);
    } catch (e) {
      return toastr.error("Oups, une erreur est survenue pendant le changement de cohorte du volontaire :", translate(e.code));
    }
  };

  return (
    <>
      <CohortDropDown
        cohort={young.cohort}
        color="#f6f6f6"
        width="200px"
        onClick={(value) => {
          setNewCohort(value);
          setModalConfirm(true);
        }}
      />
      <ModalConfirm
        size="lg"
        isOpen={modalConfirm}
        title="Changement de cohorte"
        message={
          <>
            Vous êtes sur le point de changer la cohorte de {young.firstName} {young.lastName}. <br />
          </>
        }
        onCancel={() => setModalConfirm(false)}
        onConfirm={() => {
          setModalConfirm(false);
          setModalConfirmWithMessage(true);
        }}
        disableConfirm={!motif}
        showHeaderIcon={true}>
        <>
          <div style={{ display: "grid", marginBlock: "20px", gridTemplateColumns: "1fr 375px", gridGap: "20px", alignItems: "center", justifyItems: "left", minWidth: "75%" }}>
            <p style={{ margin: 0 }}>Précisez le motif de changement de séjour :</p>

            <ActionBox color="#ffffff" width="375px">
              <UncontrolledDropdown setActiveFromChild>
                <DropdownToggle tag="button">
                  {motif || <p></p>}
                  <Chevron color="#9a9a9a" />
                </DropdownToggle>
                <DropdownMenu>
                  {motifs
                    .filter((e) => e !== motif)
                    .map((status) => {
                      return (
                        <DropdownItem key={status} className="dropdown-item" onClick={() => setMotif(status)}>
                          {status}
                        </DropdownItem>
                      );
                    })}
                </DropdownMenu>
              </UncontrolledDropdown>
            </ActionBox>
            <p style={{ margin: 0 }}>Choix de la nouvelle cohorte :</p>
            <CohortDropDown cohort={newCohort} color="#ffffff" onClick={(value) => setNewCohort(value)} width="375px" />
          </div>
          <p style={{ margin: 0, marginTop: "16px" }}>
            Veuillez vous assurer de son éligibilité , pour en savoir plus consulter{" "}
            <a href=" https://support.snu.gouv.fr/base-de-connaissance/suis-je-eligible-a-un-sejour-de-cohesion-en-2022-1" style={{ color: "#5145cc" }}>
              l’article de la base de connaissance
            </a>
          </p>
        </>
      </ModalConfirm>
      <ModalConfirmWithMessage
        isOpen={modalConfirmWithMessage}
        title="Veuillez éditer le message ci-dessous pour préciser le motif de changement de cohorte avant de l’envoyer"
        message={<p>Bonjour {young.firstName} {young.lastName},<br/> Votre changement de séjour pour le Service National Universel a été pris en compte.<br/> Vous êtes maintenant positionné(e) sur le séjour se déroulant {translateCohort(newCohort)}.</p>}
        defaultInput={defaultInput}
        onChange={() => setModalConfirmWithMessage(false)}
        onConfirm={handleChangeCohort}
        endMessage={<p>Cordialement <br/> Les équipes du Service National Universel</p>}
      />
    </>
  );
};

const CohortDropDown = ({ cohort, onClick, color, width }) => {
  const options = ["Juillet 2022", "Juin 2022", "Février 2022"];

  return (
    <ActionBox color={color} width={width}>
      <UncontrolledDropdown setActiveFromChild>
        <DropdownToggle tag="button">
          Cohorte {cohort}
          <Chevron color="#9a9a9a" />
        </DropdownToggle>
        <DropdownMenu>
          {options
            .filter((e) => e !== cohort)
            .map((status) => {
              return (
                <DropdownItem key={status} className="dropdown-item" onClick={() => onClick(status)}>
                  Cohorte {status}
                </DropdownItem>
              );
            })}
        </DropdownMenu>
      </UncontrolledDropdown>
    </ActionBox>
  );
};

const Header = styled.div`
  padding: 0 25px 0;
  display: flex;
  margin-bottom: 1rem;
  align-items: flex-start;
`;

const ActionBox = styled.div`
  margin-left: 10px;

  .dropdown-menu {
    width: ${({ width }) => width};
    a,
    div {
      white-space: nowrap;
      font-size: 14px;
      :hover {
        color: inherit;
      }
    }
  }
  button {
    background-color: ${({ color }) => color};
    border: 1px solid #cecece;
    color: #9a9a9a;
    display: inline-flex;
    flex: 1;
    justify-content: space-between;
    align-items: center;
    text-align: left;
    border-radius: 0.5rem;
    padding: 0 0 0 12px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    outline: 0;
    width: ${({ width }) => width};
    min-height: 34px;
    .edit-icon {
      height: 17px;
      margin-right: 10px;
      path {
        fill: ${({ color }) => `${color}`};
      }
    }
    .down-icon {
      margin-left: auto;
      padding: 7px 15px;
      margin-left: 15px;
      svg {
        height: 10px;
      }
      svg polygon {
        fill: ${({ color }) => `${color}`};
      }
    }
  }
  .dropdown-item {
    border-radius: 0;
    background-color: transparent;
    border: none;
    color: #767676;
    white-space: nowrap;
    font-size: 14px;
    padding: 5px 15px;
    font-weight: 400;
    :hover {
      background-color: #f3f3f3;
    }
  }
`;
