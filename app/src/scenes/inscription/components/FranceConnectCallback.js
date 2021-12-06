import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import api from "../../../services/api";
import { franceConnectUrl } from "../../../config";
import { saveYoung } from "../utils";

function getFranceConnectCallback(idRepresentant) {
  return `inscription/france-connect-callback?representant=${idRepresentant}`;
}

export default function FranceConnectCallback() {
  const young = useSelector((state) => state.Auth.young);
  // Update from France Connect.
  async function fetchData(code, id) {
    const { data, tokenId } = await api.post("/young/france-connect/user-info", { code, callback: getFranceConnectCallback(id) });
    if (data && data["email"]) {
      await saveYoung({
        ...young,
        [`parent${id}FirstName`]: data["given_name"],
        [`parent${id}LastName`]: data["family_name"],
        [`parent${id}Email`]: data["email"],
        [`parent${id}FromFranceConnect`]: "true",
      });
      const params = new URLSearchParams({
        id_token_hint: tokenId,
        state: Math.round(Math.random() * 1000000),
        post_logout_redirect_uri: `${window.location.origin}/inscription/representants`,
      }).toString();
      window.location.href = `${franceConnectUrl}/logout?${params.toString()}`;
    }
  }
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("representant");
    const code = urlParams.get("code");
    if (id && code) {
      fetchData(code, id);
    }
  }, []);

  return <div>Enregistrement des données de FranceConnect, veuillez patienter…</div>;
}
