import Img4 from "../../assets/close_icon.png";
import Img3 from "../../assets/pencil.svg";

import React, { useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";

import { translate, ROLES, canUpdateReferent, canDeleteReferent, formatPhoneNumberFR } from "../../utils";
import api from "../../services/api";
import { setUser } from "../../redux/auth/actions";
import PanelActionButton from "../../components/buttons/PanelActionButton";
import { Info, Details } from "../../components/Panel";
import PanelV2 from "../../components/PanelV2";

import ModalConfirm from "../../components/modals/ModalConfirm";
import plausibleEvent from "../../services/plausible";
import ModalReferentDeleted from "../../components/modals/ModalReferentDeleted";
import { captureEvent } from "@sentry/react";
import styled from "styled-components";

export default function UserPanel({ onChange, value }) {
  const user = useSelector((state) => state.Auth.user);
  if (user?.structureId) captureEvent("Team member has a structureId", { user: user._id, structureId: user.structureId });
  const dispatch = useDispatch();
  const history = useHistory();
  const [modal, setModal] = useState({ isOpen: false, onConfirm: null });
  const [modalReferentDeleted, setModalReferentDeleted] = useState({ isOpen: false });

  const handleImpersonate = async () => {
    try {
      plausibleEvent("Utilisateurs/CTA - Prendre sa place");
      const { ok, data, token } = await api.post(`/referent/signin_as/referent/${value._id}`);
      if (!ok) return toastr.error("Oops, une erreur est survenu lors de la masquarade !");
      history.push("/dashboard");
      if (token) api.setToken(token);
      if (data) dispatch(setUser(data));
    } catch (e) {
      toastr.error("Oops, une erreur est survenu lors de la masquarade !", translate(e.code));
    }
  };

  const onClickDelete = () => {
    setModal({
      isOpen: true,
      onConfirm: onConfirmDelete,
      title: `Êtes-vous sûr(e) de vouloir supprimer le compte de ${value.firstName} ${value.lastName} ?`,
      message: "Cette action est irréversible.",
    });
  };

  const onReferentDeleted = () => {
    setModalReferentDeleted({
      isOpen: true,
    });
  };

  const onConfirmDelete = async () => {
    try {
      const { ok, code } = await api.remove(`/referent/${value._id}`);
      if (!ok && code === "OPERATION_UNAUTHORIZED") return toastr.error("Vous n'avez pas les droits pour effectuer cette action");
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      return onReferentDeleted();
    } catch (e) {
      return toastr.error("Oups, une erreur est survenue pendant la supression du profil :", translate(e.code));
    }
  };

  if (!value) return <div />;
  return (
    <PanelV2 open={value ? true : false} onClose={onChange} title={`${value.firstName} ${value.lastName}`}>
      <Panel>
        <div className="info">
          {canUpdateReferent({ actor: user, originalTarget: value }) && (
            <div style={{ display: "flex", flexWrap: "wrap" }}>
              <Link to={`/user/${value._id}`}>
                <PanelActionButton icon="eye" title="Consulter" />
              </Link>
              {user.role === ROLES.ADMIN ? <PanelActionButton onClick={handleImpersonate} icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" /> : null}
              {canDeleteReferent({ actor: user, originalTarget: value }) ? <PanelActionButton onClick={onClickDelete} icon="bin" title="Supprimer" /> : null}
            </div>
          )}
        </div>
        <Info title="Coordonnées">
          <Details title="E-mail" value={value.email} copy />
        </Info>
        <Info title="Informations">
          <Details title="Rôle" value={translate(value.role)} />
          <Details title="Fonction" value={translate(value.subRole)} />
          <Details title="Région" value={value.region} />
          <Details title="Département" value={value.department} />
          <Details title="Tel fixe" value={formatPhoneNumberFR(value.phone)} />
          <Details title="Tel Mobile" value={formatPhoneNumberFR(value.mobile)} />
        </Info>
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
        <ModalReferentDeleted isOpen={modalReferentDeleted?.isOpen} onConfirm={() => history.go(0)} />
      </Panel>
    </PanelV2>
  );
}

const Panel = styled.div`
  .close {
    color: #000;
    font-weight: 400;
    width: 45px;
    height: 45px;
    background: url(${Img4}) center no-repeat;
    background-size: 12px;
    padding: 15px;
    position: absolute;
    right: 15px;
    top: 15px;
    cursor: pointer;
  }
  .title {
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 2px;
  }
  hr {
    margin: 20px 0 30px;
  }
  .info {
    padding: 2rem 0;
    border-bottom: 1px solid #f2f1f1;
    &-title {
      font-weight: 500;
      font-size: 18px;
      padding-right: 35px;
    }
    &-edit {
      width: 30px;
      height: 26px;
      background: url(${Img3}) center no-repeat;
      background-size: 16px;
      position: absolute;
      right: 0;
      top: 0;
      cursor: pointer;
    }
  }
  .detail {
    border-bottom: 0.5px solid rgba(244, 245, 247, 0.5);
    padding: 5px 0;
    display: flex;
    font-size: 14px;
    text-align: left;
    align-items: flex-start;
    justify-content: space-between;
    margin-top: 10px;
    &-title {
      font-weight: bold;
      min-width: 100px;
      margin-right: 0.5rem;
    }
    &-text {
      text-align: left;
      color: rgba(26, 32, 44);
      a {
        color: #5245cc;
        :hover {
          text-decoration: underline;
        }
      }
    }
    .description {
      font-weight: 400;
      color: #aaa;
      font-size: 0.8rem;
    }
    .quote {
      font-size: 0.9rem;
      font-weight: 400;
      font-style: italic;
    }
  }
  .icon {
    cursor: pointer;
    margin: 0 0.5rem;
  }
  .application-detail {
    display: flex;
    flex-direction: column;
    padding: 5px 20px;
    margin-bottom: 0.5rem;
    text-align: left;
    :hover {
      box-shadow: rgba(0, 0, 0, 0.1) 0px 2px 12px 0px;
      background: #f9f9f9;
    }
    &-priority {
      font-size: 0.75rem;
      color: #5245cc;
      margin-right: 0.5rem;
    }
    &-text {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      display: block;
      text-overflow: ellipsis;
    }
  }
  .quote {
    font-size: 0.9rem;
    font-weight: 400;
    font-style: italic;
  }
`;
