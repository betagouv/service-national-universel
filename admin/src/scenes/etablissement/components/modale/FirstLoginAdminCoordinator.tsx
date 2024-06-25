import React, { useState, useEffect } from "react";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { useHistory } from "react-router-dom";

import { ProfilePic } from "@snu/ds";
import { ModalConfirmation } from "@snu/ds/admin";
import { User } from "@/types";
import { ROLES, SUB_ROLES } from "snu-lib";

interface Props {
  user: User;
}

export default function FirstLoginAdminCoordinator({ user }: Props) {
  const [modalCoordinator, setModalCoordinator] = useState(false);
  const history = useHistory();
  const firstLogin = localStorage.getItem("cle_referent_signup_first_time");

  useEffect(() => {
    if (firstLogin && user.role === ROLES.ADMINISTRATEUR_CLE && user.subRole === SUB_ROLES.coordinateur_cle) {
      setModalCoordinator(true);
    }
  }, [firstLogin]);

  {
    /* First login ADMINISTRATEUR_CLE coordinateur-cle */
  }

  return (
    <ModalConfirmation
      isOpen={modalCoordinator}
      onClose={() => {
        setModalCoordinator(false);
        localStorage.removeItem("cle_referent_signup_first_time");
      }}
      className="md:max-w-[700px]"
      icon={<ProfilePic initials={`${user.firstName.charAt(0)}${user.lastName.charAt(0)}`} />}
      title={`Bonjour ${user.firstName} ${user.lastName} !`}
      text="Bienvenue sur votre compte Administrateur CLE en tant que Coordinateur d’établissement. Vous pouvez créer une classe engagée, suivre l'évolution de celles déjà créées et consulter les inscriptions des élèves."
      actions={[
        { title: "Fermer", isCancel: true },
        { title: "Voir mes classes", leftIcon: <HiOutlineOfficeBuilding size={20} />, onClick: () => history.push("/classes") },
      ]}
    />
  );
}
