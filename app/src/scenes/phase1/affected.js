import React, { useState, useEffect } from "react";
import { HeroContainer, Hero, Separator } from "../../components/Content";
import NextStep from "./nextStep";
import api from "../../services/api";
import { toastr } from "react-redux-toastr";
import { useSelector } from "react-redux";
import { translate } from "../../utils";

export default () => {
  const young = useSelector((state) => state.Auth.young);

  const [center, setCenter] = useState();

  useEffect(() => {
    (async () => {
      const { data, code, ok } = await api.get(`/cohesion-center/young/${young._id}`);
      if (!ok) return toastr.error("error", translate(code));
      setCenter(data);
    })();
  }, []);

  if (!center) return <div />;
  return (
    <HeroContainer>
      <Hero>
        <div className="content">
          <h1>
            <strong>Mon séjour de cohésion</strong>
          </h1>
          <p>
            Le SNU vous donne l'opportunité de découvrir la vie collective au sein d'un centre accueillant environ 200 jeunes de votre région pour créer ainsi des liens nouveaux et
            développer votre culture de l’engagement et ainsi affirmer votre place dans la société.
          </p>
          <Separator />
          <p>
            <strong>Votre convocation</strong>
            <br />
            Vous êtes actuellement affecté(e) à un centre de cohésion.
            <br />
            <span style={{ color: "#5145cd" }}>{`${center?.name}, ${center?.address} ${center?.zip} ${center?.city}, ${center?.department}, ${center?.region}`}</span>
          </p>
        </div>
        <div className="thumb" />
      </Hero>
      <NextStep />
    </HeroContainer>
  );
};
