import React, { useState, useEffect } from "react";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { useHistory } from "react-router-dom";

import { ProfilePic } from "@snu/ds";
import { ModalConfirmation } from "@snu/ds/admin";
import { User } from "@/types";
import { isReferentClasse } from "snu-lib";
import { REFERENT_SIGNUP_FIRSTTIME_LOCAL_STORAGE_KEY } from "@/services/cle";

type Props = {
  user: User;
  classeId: string;
};

/* First login ADMINISTRATEUR_CLE referent_classe */
export default function FirstLoginRefClasse({ user, classeId }: Props) {
  const history = useHistory();

  const [showModal, setShowModal] = useState(false);

  const firstLogin = localStorage.getItem(REFERENT_SIGNUP_FIRSTTIME_LOCAL_STORAGE_KEY);

  useEffect(() => {
    if (firstLogin && isReferentClasse(user)) {
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
