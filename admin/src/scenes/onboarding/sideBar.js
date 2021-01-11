import React from "react";
import styled from "styled-components";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../../redux/auth/actions";
import api from "../../services/api";
export default ({ step }) => {
  const dispatch = useDispatch();

  async function logout() {
    await api.post(`/referent/logout`);
    dispatch(setUser(null));
  }

  return (
    <Sidebar>
      <Message step={step} />
      <div style={{ textAlign: "center", padding: "0 20px" }}>
        <img src={require("../../assets/logo-snu.png")} height={100} />
        <div className="bottom">
          <div className="logout" onClick={logout}>
            Se déconnecter
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

const Message = ({ step }) => {
  const user = useSelector((state) => state.Auth.user);

  if (step === "profil") {
    return (
      <Note>
        <div>{`Bienvenue ${user.firstName} ${user.lastName}!`}</div>
        <div>
          Commencez par <strong>compléter votre profil</strong> pour finaliser la création de votre compte de responsable de structure d’accueil SNU.
        </div>
      </Note>
    );
  }
  if (step === "structure") {
    return (
      <Note>
        <div>Dites-nous en plus sur votre structure !</div>
        <div>
          Ces <strong>informations générales</strong> permettront au service référent du SNU de mieux vous connaître.
        </div>
      </Note>
    );
  }
  if (step === "address") {
    return (
      <Note>
        <div>Dites nous plus sur votre structure.</div>
        Merci de <strong>compléter l'adresse</strong> de votre structure d’accueil SNU.
      </Note>
    );
  }
  return <div />;
};

const Sidebar = styled.div`
  flex: 0 0 25%;
  max-width: 25%;
  background: linear-gradient(90deg, rgb(0, 106, 206), rgb(71, 143, 218));
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  .bottom {
    border-top: 1px solid rgb(99, 179, 237);
    padding: 25px;
    margin-top: 45px;
    cursor: pointer;
    .logout {
      font-weight: 400;
      color: #fff;
      opacity: 0.8;
    }
    .logout:hover {
      opacity: 1;
    }
  }
`;

const Note = styled.div`
  background: rgba(255, 255, 255, 0.2);
  margin: 95px auto;
  width: calc(100% - 80px);
  padding: 20px 25px;
  color: #fff;
  border-radius: 8px;
  text-align: center;
  letter-spacing: 0.02em;
`;

const Nav = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  max-width: 100%;
  margin: 0 auto;
  padding: 20px;
`;
const NavItem = styled.div`
  text-align: center;
  padding: 15px;
  position: relative;
  flex: 1;
  .number {
    height: 24px;
    width: 24px;
    border-radius: 50%;
    background-color: #fff;
    font-size: 14px;
    line-height: 1.5em;
    font-weight: 500;
    text-align: center;
    margin: 0 auto 5px;
    cursor: pointer;
    position: relative;
    z-index: 2;
    display: block;

    border: 2px solid #6a6f85;
    color: #6a6f85;

    ${({ current }) =>
      current &&
      `border: 2px solid #3182ce;
      color: #3182ce;    
    `}

    ${({ active }) =>
      active &&
      `border: 2px solid #303133;
      color: #303133;    
    `}
  }

  :not(:first-child)::after {
    content: "";
    display: block;
    width: 100%;
    height: 2px;
    background-color: #6a6f85;
    position: absolute;
    right: 50%;
    top: 27px;
    z-index: 1;

    ${({ current, active }) => current && `background-color: #3182ce`};
    ${({ active }) => active && `background-color: #303133`};
  }
  .title {
    font-size: 16px;
    margin-bottom: 5px;

    color: #6a6f85;
    ${({ current, active }) => (current || active) && `color: #3182ce`};
    ${({ active }) => active && `color: #303133`};

    font-weight: ${({ active }) => (active ? 600 : 400)};
  }
  .subtitle {
    font-size: 12px;
    color: #6a6f85;

    ${({ current, active }) => (current || active) && `color: #3182ce`};
    ${({ active }) => active && `color: #303133`};
  }
`;
