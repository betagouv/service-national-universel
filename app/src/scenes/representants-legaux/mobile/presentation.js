import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Navbar from "../components/Navbar";
import queryString from "query-string";
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
    history.push(`/representants-legaux/verification?token=${token}&parent=${parent}`);
  }
  return (
    <>
      <Navbar step={step} />
      <div className="bg-white p-4 text-[#161616]">
        <h1 className="text-[22px] font-bold">Déclaration sur l’honneur</h1>
        <div>TODO</div>
      </div>
      <div className="fixed bottom-0 w-full z-50">
        <div className="flex flex-row shadow-ninaInverted p-4 bg-white gap-4">
          <button className={"flex items-center justify-center p-2 w-full cursor-pointer bg-[#000091] text-white"} onClick={() => onSubmit()}>
            Continuer vers la vérification
          </button>
        </div>
        <div className="flex flex-row px-4 pb-4 bg-white gap-4">Votre consentement ne sera recueilli qu’à la troisième étape de ce formulaire</div>
      </div>
    </>
  );
}
