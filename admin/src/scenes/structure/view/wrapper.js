import React, { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";

import PanelActionButton from "../../../components/buttons/PanelActionButton";
import { translate, STRUCTURE_STATUS_COLORS, ROLES } from "../../../utils";
import api from "../../../services/api";
import TabList from "../../../components/views/TabList";
import Tab from "../../../components/views/Tab";
import Badge from "../../../components/Badge";
import ModalConfirm from "../../../components/modals/ModalConfirm";

export default ({ children, structure, tab }) => {
  const history = useHistory();
  const user = useSelector((state) => state.Auth.user);
  const isResponsible = user.role === ROLES.RESPONSIBLE;
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });

  const onClickDelete = () => {
    setModal({ isOpen: true, onConfirm: onConfirmDelete, title: "Êtes-vous sûr(e) de vouloir supprimer cette structure ?", message: "Cette action est irréversible." });
  };

  const onConfirmDelete = async () => {
    try {
      const { ok, code } = await api.remove(`/structure/${structure._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      toastr.success("Cette structure a été supprimée.");
      return history.push(`/structure`);
    } catch (e) {
      console.log(e);
      return toastr.error("Oups, une erreur est survenue pendant la supression de la structure :", translate(e.code));
    }
  };
  if (!structure) return null;
  return (
    <div style={{ flex: tab === "missions" ? "0%" : 2, position: "relative", padding: "3rem" }}>
      <Header>
        <div style={{ flex: 1 }}>
          <Title>
            {structure.name} <Badge color={STRUCTURE_STATUS_COLORS[structure.status]} text={translate(structure.status)} />
            {structure.isMilitaryPreparation === "true" ? <Badge text="Préparation Militaire" /> : null}
          </Title>

          <TabList>
            <Tab isActive={tab === "details"} onClick={() => history.push(`/structure/${structure._id}`)}>
              Détails
            </Tab>
            {!isResponsible && (
              <>
                <Tab isActive={tab === "missions"} onClick={() => history.push(`/structure/${structure._id}/missions`)}>
                  Missions
                </Tab>
                {user.role === ROLES.ADMIN ? (
                  <Tab isActive={tab === "historique"} onClick={() => history.push(`/structure/${structure._id}/historique`)}>
                    Historique <i style={{ color: "#5145cd", fontWeight: "lighter", fontSize: ".85rem" }}>Bêta</i>
                  </Tab>
                ) : null}
              </>
            )}
          </TabList>
        </div>
        <div style={{ display: "flex" }}>
          {!isResponsible && (
            <Link to={`/mission/create/${structure._id}`}>
              <PanelActionButton icon="plus" title="Nouvelle mission" />
            </Link>
          )}
          <Link to={`/structure/${structure._id}/edit`}>
            <PanelActionButton icon="pencil" title="Modifier" />
          </Link>
          <PanelActionButton onClick={onClickDelete} icon="bin" title="Supprimer" />
        </div>
      </Header>
      {children}
      <ModalConfirm
        isOpen={modal?.isOpen}
        title={modal?.title}
        message={modal?.message}
        onChange={() => setModal({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modal?.onConfirm();
          setModal({ isOpen: false, onConfirm: null });
        }}
      />
    </div>
  );
};

const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 10px;
`;

const Header = styled.div`
  padding: 0 25px 0;
  display: flex;
  margin-bottom: 1rem;
  align-items: flex-start;
`;
