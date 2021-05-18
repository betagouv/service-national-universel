import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { HeroContainer, Hero, Content, Alert } from "../../components/Content";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";

export default () => {
  const young = useSelector((state) => state.Auth.young);
  const [showAlert, setShowAlert] = useState(true);

  const [center, setCenter] = useState();

  useEffect(() => {
    (async () => {
      const { data, code, ok } = await api.get(`/cohesion-center/young/${young._id}`);
      if (!ok) toastr.error("error", code);
      setCenter(data);
    })();
  }, []);

  if (!center) return <div />;

  return (
    <HeroContainer>
      <Hero>
        {showAlert && (
          <Alert>
            <div className="text">
              <strong>EN ATTENTE D'ACCEPTATION</strong>
            </div>
            <img src={require("../../assets/close.svg")} height={15} onClick={() => setShowAlert(false)} />
          </Alert>
        )}
        <Content showAlert={showAlert}>
          <h1>
            <strong>{young.firstName},</strong> vous avez été affecté à un centre !
          </h1>
          <p>
            Nous avons le plaisir de vous indiquer qu'une place vous est proposée pour participer au séjour de cohésion du Service National Universel du 21 juin au 2 juillet 2021 !
          </p>
          <p>
            <strong>Votre lieu d'affectation</strong>
            <br />
            Vous avez été affecté(e) au centre de séjour de :
            <br />
            <span style={{ color: "#5145cd" }}>{`${center?.name}, ${center?.address} ${center?.zip} ${center?.city}, ${center?.department}, ${center?.region}`}</span>
          </p>
        </Content>
        <div className="thumb" />
      </Hero>
    </HeroContainer>
  );
};
