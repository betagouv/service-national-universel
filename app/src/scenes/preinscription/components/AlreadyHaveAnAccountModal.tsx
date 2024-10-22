import React from "react";
import { alreadyHaveAnAccountModal } from "./Modals";
import Button from "@codegouvfr/react-dsfr/Button";
import { Link } from "react-router-dom";

const AlreadyHaveAnAccountModal = () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id") || "";
  return (
    <alreadyHaveAnAccountModal.Component title="Finaliser mon inscription" iconId="fr-icon-edit-line">
      <p>Vous avez déjà créé votre compte mais vous n'avez pas terminé votre inscription&nbsp;?</p>
      <Link to="/auth" className="w-full">
        <Button className="w-full">Me connecter</Button>
      </Link>
      <div className="relative my-2 px-2">
        <span className="text-sm font-bold left-1/2 absolute top-4">OU</span>
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
