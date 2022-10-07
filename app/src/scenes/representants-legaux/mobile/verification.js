import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import queryString from "query-string";
import StickyButton from "../../../components/inscription/stickyButton";
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

  function onSubmit() {
    history.push(`/representants-legaux/consentement?token=${token}&parent=${parent}`);
  }
  return (
    <>
      <Navbar step={step} />
      <div className="bg-white p-4 text-[#161616]">
        <h1 className="text-[22px] font-bold">Voici les informations transmises par Joao</h1>
        <div>TODO</div>
      </div>
      <StickyButton text={"Suivant"} onClick={() => onSubmit()} onClickPrevious={() => history.push("/representants-legaux/presentation")} />
    </>
  );
}
