import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import queryString from "query-string";
import StickyButton from "../../../components/inscription/stickyButton";
import FranceConnectButton from "../../inscription/components/FranceConnectButton";
import Navbar from "../components/Navbar";
import Loader from "../../../components/Loader";
import api from "../../../services/api";

export default function MobileCniInvalide({ step }) {
  const history = useHistory();
  const params = queryString.parse(location.search);
  const { token, parent } = params;
  const [young, setYoung] = useState(null);

  useEffect(() => {
    async function getYoungFromToken() {
      const redirectInvalidToken = () => history.push("/representants-legaux/token-invalide");
      if (!token) redirectInvalidToken();
      const { ok, data } = await api.get(`/representants-legaux/young?token=${token}&parent=${parent}`);

      if (!ok) return redirectInvalidToken();
      setYoung(data);
    }
    getYoungFromToken();
  }, []);

  if (!young) return <Loader />;

  const isParentFromFranceConnect = young[`parent${parent}FromFranceConnect`] === "true";

  function getFranceConnectCallback() {
    return `representants-legaux/france-connect-callback?parent=${parent}&token=${token}`;
  }
  function onSubmit() {
    history.push(`/representants-legaux/done?token=${token}&parent=${parent}`);
  }
  return (
    <>
      <Navbar step={step} />
      <div className="bg-white p-4 text-[#161616]">
        <h1 className="text-[22px] font-bold">Apporter votre consentement</h1>
        {isParentFromFranceConnect ? (
          <i>Les information en provenance de FranceConnect du représentant légal n°1 ont bien été enregistrées.</i>
        ) : (
          <FranceConnectButton callback={getFranceConnectCallback()} />
        )}

        <div>TODO</div>
      </div>
      <StickyButton text={"Suivant"} onClick={() => onSubmit()} onClickPrevious={() => history.push(`/representants-legaux/verification?token=${token}&parent=${parent}`)} />
    </>
  );
}
