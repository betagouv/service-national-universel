import React, { useState, useEffect } from "react";
import { HiOutlineOfficeBuilding } from "react-icons/hi";
import { useHistory } from "react-router-dom";

import { ProfilePic } from "@snu/ds";
import { ModalConfirmation } from "@snu/ds/admin";
import { User } from "@/types";
import { isChefEtablissement, EtablissementType } from "snu-lib";

import { REFERENT_SIGNUP_FIRSTTIME_LOCAL_STORAGE_KEY } from "@/services/cle";

interface Props {
  user: User;
  etablissement: EtablissementType;
}

/* First login ADMINISTRATEUR_CLE referent_etablissement */
export default function FirstLoginAdminChef({ user }: Props) {
  const history = useHistory();

  const [showModal, setShowModal] = useState(false);

  const firstLogin = localStorage.getItem(REFERENT_SIGNUP_FIRSTTIME_LOCAL_STORAGE_KEY);

  useEffect(() => {
    if (firstLogin && isChefEtablissement(user)) {
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
      text="Bienvenue sur votre compte Administrateur en tant que Chef d’établissement. Vous devez mettre à jour l’effectif prévisionnel du nombre d’élèves. Vous pouvez modifier les informations de vos classes, et ajouter un ou deux coordinateurs d’établissement."
      actions={[
        { title: "Fermer", isCancel: true },
        { title: "Voir la liste de mes classes", leftIcon: <HiOutlineOfficeBuilding size={20} />, onClick: () => history.push("/classes") },
      ]}
    />
  );
}
