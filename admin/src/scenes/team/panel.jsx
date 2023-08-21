import React, {  useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";

import { translate, ROLES, canUpdateReferent, canDeleteReferent, formatPhoneNumberFR } from "../../utils";
import api from "../../services/api";
import { setUser } from "../../redux/auth/actions";
import PanelActionButton from "../../components/buttons/PanelActionButton";
import Panel, { Info, Details } from "../../components/Panel";

import ModalConfirm from "../../components/modals/ModalConfirm";
import plausibleEvent from "../../services/plausible";
import ModalReferentDeleted from "../../components/modals/ModalReferentDeleted";

export default function UserPanel({ onChange, value }) {
  const user = useSelector((state) => state.Auth.user);
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
    <Panel>
      <div className="info">
        <div style={{ display: "flex" }}>
          <div className="title">{`${value.firstName} ${value.lastName}`}</div>
          <div className="close" onClick={onChange} />
        </div>
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
  );
}
