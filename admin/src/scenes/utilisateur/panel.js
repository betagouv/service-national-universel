import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";

import { translate } from "../../utils";
import LoadingButton from "../../components/loadingButton";
import api from "../../services/api";
import { setUser } from "../../redux/auth/actions";

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
      if (token) api.setToken(token);
      if (data) dispatch(setUser(data));
      history.push("/dashboard");
    } catch (e) {
      console.log(e);
      toastr.error("Oops, une erreur est survenu lors de la masquarade !", translate(e.code));
    }
  };

  return (
    <Panel>
      <div className="close" onClick={onChange} />
      <div className="info">
        <div className="title">{`${value.firstName} ${value.lastName}`}</div>
        {canModify(user, value) && (
          <div style={{ display: "flex" }}>
            <Link to={`/user/${value._id}`}>
              <Button icon={require("../../assets/eye.svg")} color="white">
                Consulter
              </Button>
            </Link>
            <Button onClick={handleImpersonate} icon={require("../../assets/impersonate.svg")} color="white">
              Prendre&nbsp;sa&nbsp;place
            </Button>
          </div>
        )}
      </div>
      <Info title="Coordonnées">
        <Details title="E-mail" value={value.email} />
      </Info>
      <Info title="Informations">
        <Details title="Rôle" value={translate(value.role)} />
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

const Panel = styled.div`
  background: #ffffff;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 1;
  flex: 1;
  max-width: 420px;
  position: relative;
  min-height: 100vh;
  font-size: 14px;
  align-self: flex-start;
  position: sticky;
  top: 68px;
  right: 0;
  /* overflow-y: auto; */
  .close {
    color: #000;
    font-weight: 400;
    width: 45px;
    height: 45px;
    background: url(${require("../../assets/close_icon.png")}) center no-repeat;
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
  .info {
    padding: 30px 25px;
    border-bottom: 1px solid #f2f1f1;
    &-title {
      font-weight: 500;
      font-size: 18px;
      margin-bottom: 15px;
      padding-right: 35px;
    }
    &-edit {
      width: 30px;
      height: 26px;
      background: url(${require("../../assets/pencil.svg")}) center no-repeat;
      background-size: 16px;
      position: absolute;
      right: 0;
      top: 0;
      cursor: pointer;
    }
  }
  .detail {
    display: flex;
    align-items: flex-end;
    padding: 5px 20px;
    font-size: 14px;
    text-align: left;
    &-title {
      min-width: 100px;
      width: 100px;
      margin-right: 5px;
    }
  }
  .quote {
    font-size: 18px;
    font-weight: 400;
    font-style: italic;
  }
`;

const InfoBtn = styled(LoadingButton)`
  color: #555;
  background: url(${require("../../assets/eye.svg")}) left 15px center no-repeat;
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.16);
  border: 0;
  outline: 0;
  border-radius: 5px;
  padding: 8px 25px 8px 40px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-right: 5px;
  margin-top: 1rem;
`;

const Button = styled(LoadingButton)`
  color: #555;
  background: ${({ icon }) => `url(${icon}) left 15px center no-repeat`};
  box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.16);
  border: 0;
  outline: 0;
  border-radius: 5px;
  padding: 0.2rem 1rem;
  padding-left: 2.5rem;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-right: 5px;
  margin-top: 1rem;
`;
