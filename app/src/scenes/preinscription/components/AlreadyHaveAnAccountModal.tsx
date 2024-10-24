import React from "react";
import { alreadyHaveAnAccountModal } from "./Modals";
import Button from "@codegouvfr/react-dsfr/Button";
import { Link } from "react-router-dom";

const AlreadyHaveAnAccountModal = () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "";
  return (
    <alreadyHaveAnAccountModal.Component title="Finaliser mon inscription" iconId="fr-icon-edit-line" size="small">
      <p>Vous avez déjà créé votre compte mais vous n'avez pas terminé votre inscription&nbsp;?</p>
      <Link to="/auth">
        <Button style={{ width: "100%", textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }}>Me connecter</Button>
      </Link>
      <div className="relative my-2 px-2">
        <span className="absolute text-sm font-bold left-1/2 -translate-x-1/2 top-4 bg-white px-3">OU</span>
        <br></br>
        <hr className=""></hr>
      </div>
      <p>Vous avez un compte hors Classes engagées ? Contactez le support pour mettre à jour votre compte et vous faire gagner du temps.</p>
      <Link to={`/besoin-d-aide?parcours=CLE&q=HTS_TO_CLE&classeId=${id}`} className="text-blue-france-sun-113 pb-1">
        Contacter le support
      </Link>
    </alreadyHaveAnAccountModal.Component>
  );
};

export default AlreadyHaveAnAccountModal;
