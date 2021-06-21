import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { toastr } from "react-redux-toastr";

import { translate } from "../../utils";
import api from "../../services/api";
import { setUser } from "../../redux/auth/actions";
import PanelActionButton from "../../components/buttons/PanelActionButton";
import Panel from "../../components/Panel";

// Sorry about that: return true, return false, false, true, false.
function canModify(user, value) {
  if (user.role === "admin") return true;
  // https://trello.com/c/Wv2TrQnQ/383-admin-ajouter-onglet-utilisateurs-pour-les-r%C3%A9f%C3%A9rents
  if (user.role === "referent_region") {
    if (["referent_department", "referent_region"].includes(value.role) && user.region === value.region) return true;
    return false;
  }
  if (user.role === "referent_department") {
    if (user.role === value.role && user.department === value.department) return true;
    return false;
  }
  return false;
}

export default ({ onChange, value }) => {
  if (!value) return <div />;
  const [structure, setStructure] = useState();
  const user = useSelector((state) => state.Auth.user);
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    (async () => {
      if (!value.structureId) return;
      const { ok, data, code } = await api.get(`/structure/${value.structureId}`);
      if (!ok) return toastr.error("Oups, une erreur est survnue lors de la récuperation de la structure", translate(code));
      return setStructure(data);
    })();
  }, [value]);

  const handleImpersonate = async () => {
    try {
      const { ok, data, token } = await api.post(`/referent/signin_as/referent/${value._id}`);
      if (!ok) return toastr.error("Oops, une erreur est survenu lors de la masquarade !", translate(e.code));
      history.push("/dashboard");
      if (token) api.setToken(token);
      if (data) dispatch(setUser(data));
    } catch (e) {
      console.log(e);
      toastr.error("Oops, une erreur est survenu lors de la masquarade !", translate(e.code));
    }
  };

  return (
    <Panel>
      <div className="info">
        <div style={{ display: "flex" }}>
          <div className="title">{`${value.firstName} ${value.lastName}`}</div>
          <div className="close" onClick={onChange} />
        </div>
        {canModify(user, value) && (
          <div style={{ display: "flex" }}>
            <Link to={`/user/${value._id}`}>
              <PanelActionButton icon="eye" title="Consulter" />
            </Link>
            <PanelActionButton onClick={handleImpersonate} icon="impersonate" title="Prendre&nbsp;sa&nbsp;place" />
          </div>
        )}
      </div>
      <Info title="Coordonnées">
        <Details title="E-mail" value={value.email} />
      </Info>
      <Info title="Informations">
        <Details title="Rôle" value={translate(value.role)} />
        <Details title="Fonction" value={translate(value.subRole)} />
        {structure ? (
          <div className="detail">
            <div className="detail-title">Structure :</div>
            <Link to={`/structure/${structure._id}`}>
              <div className="detail-text">{structure.name}</div>
            </Link>
          </div>
        ) : null}
        <Details title="Région" value={value.region} />
        <Details title="Département" value={value.department} />
      </Info>
      {/* <div>
        {Object.keys(value).map((e) => {
          return <div>{`${e}:${value[e]}`}</div>;
        })}
      </div> */}
    </Panel>
  );
};

const Info = ({ children, title }) => {
  return (
    <div className="info">
      <div style={{ position: "relative" }}>
        <div className="info-title">{title}</div>
      </div>
      {children}
    </div>
  );
};

const Details = ({ title, value, children }) => {
  if (!value) return <div />;
  return (
    <div className="detail">
      <div className="detail-title">{`${title} :`}</div>
      <div className="detail-text">{value}</div>
      {children ? children : null}
    </div>
  );
};
