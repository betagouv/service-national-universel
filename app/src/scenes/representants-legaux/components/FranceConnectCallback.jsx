import React, { useEffect } from "react";
import api from "../../../services/api";
import { franceConnectUrl } from "../../../config";

function getFranceConnectCallback(parent, token) {
  return `representants-legaux/france-connect-callback?parent=${parent}&token=${token}`;
}

export default function FranceConnectCallback() {
  // Update from France Connect.
  async function fetchData(code, id, token, state) {
    const { data, tokenId } = await api.post("/young/france-connect/user-info", { code, callback: getFranceConnectCallback(id, token), state });
    if (data && data["email"]) {
      await api.put(`/representants-legaux/representant-fromFranceConnect/${id}?parent=${id}&token=${token}`, {
        [`parent${id}FirstName`]: data["given_name"],
        [`parent${id}LastName`]: data["family_name"],
        [`parent${id}Email`]: data["email"],
        [`parent${id}FromFranceConnect`]: "true",
      });
      const params = new URLSearchParams({
        id_token_hint: tokenId,
        state: Math.round(Math.random() * 1000000),
        post_logout_redirect_uri: `${window.location.origin}/representants-legaux/${id === "1" ? "consentement" : "consentement-parent2"}?parent=${id}&token=${token}`,
      }).toString();
      window.location.href = `${franceConnectUrl}/logout?${params.toString()}`;
    }
  }
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("parent");
    const token = urlParams.get("token");
    const code = urlParams.get("code");
    const state = urlParams.get("state");
    if (id && code) {
      fetchData(code, id, token, state);
    }
  }, []);

  return <div>Enregistrement des données de FranceConnect, veuillez patienter…</div>;
}
