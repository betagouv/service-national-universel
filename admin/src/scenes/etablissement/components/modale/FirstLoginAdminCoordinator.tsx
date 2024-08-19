import React, { useState, useEffect } from "react";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { useHistory } from "react-router-dom";

import { ProfilePic } from "@snu/ds";
import { ModalConfirmation } from "@snu/ds/admin";
import { User } from "@/types";
import { isCoordinateurEtablissement } from "snu-lib";
import { REFERENT_SIGNUP_FIRSTTIME_LOCAL_STORAGE_KEY } from "@/services/cle";

interface Props {
  user: User;
}

/* First login ADMINISTRATEUR_CLE coordinateur-cle */
export default function FirstLoginAdminCoordinator({ user }: Props) {
  const history = useHistory();

  const [showModal, setShowModal] = useState(false);

  const firstLogin = localStorage.getItem(REFERENT_SIGNUP_FIRSTTIME_LOCAL_STORAGE_KEY);

  useEffect(() => {
    if (firstLogin && isCoordinateurEtablissement(user)) {
      setShowModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstLogin]);

  return (
    <ModalConfirmation
      isOpen={showModal}
      onClose={() => {
        setShowModal(false);
        localStorage.removeItem(REFERENT_SIGNUP_FIRSTTIME_LOCAL_STORAGE_KEY);
      }}
      className="md:max-w-[700px]"
      icon={<ProfilePic initials={`${user.firstName?.charAt(0)}${user.lastName?.charAt(0)}`} />}
      title={`Bonjour ${user.firstName} ${user.lastName} !`}
      text="Bienvenue sur votre compte Administrateur CLE en tant que Coordinateur d’établissement. Vous pouvez créer une classe engagée, suivre l'évolution de celles déjà créées et consulter les inscriptions des élèves."
      actions={[
        { title: "Fermer", isCancel: true },
        { title: "Voir mes classes", leftIcon: <HiOutlineOfficeBuilding size={20} />, onClick: () => history.push("/classes") },
      ]}
    />
  );
}
