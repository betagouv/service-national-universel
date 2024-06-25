import React, { useState, useEffect } from "react";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { useHistory } from "react-router-dom";

import { ProfilePic } from "@snu/ds";
import { ModalConfirmation } from "@snu/ds/admin";
import { User } from "@/types";
import { ROLES } from "snu-lib";

type Props = {
  user: User;
  classeId: string;
};

export default function FirstLoginRefClasse({ user, classeId }: Props) {
  const [modalClassReferent, setModalClassReferent] = useState(false);
  const history = useHistory();
  const firstLogin = localStorage.getItem("cle_referent_signup_first_time");

  useEffect(() => {
    if (firstLogin && user.role === ROLES.REFERENT_CLASSE) {
      setModalClassReferent(true);
    }
  }, [firstLogin]);

  {
    /* First login ADMINISTRATEUR_CLE referent_classe */
  }

  return (
    <ModalConfirmation
      isOpen={modalClassReferent}
      onClose={() => {
        setModalClassReferent(false);
        localStorage.removeItem("cle_referent_signup_first_time");
      }}
      className="md:max-w-[700px]"
      icon={<ProfilePic initials={`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`} />}
      title={`Bonjour ${user.firstName} ${user.lastName} !`}
      text="Bienvenue sur votre compte SNU en tant que Référent de classe. Vous pouvez compléter la fiche de votre classe en renseignant toutes les informations."
      actions={[
        { title: "Fermer", isCancel: true },
        { title: "Compléter les informations", leftIcon: <HiOutlineOfficeBuilding size={20} />, onClick: () => history.push(`/classes/${classeId}`) },
      ]}
    />
  );
}
