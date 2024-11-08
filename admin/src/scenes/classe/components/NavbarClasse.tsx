import React from "react";
import { useHistory } from "react-router-dom";
import { HiOutlineClipboardList } from "react-icons/hi";
import { LuHistory } from "react-icons/lu";

import { Navbar } from "@snu/ds/admin";

interface Props {
  classeId: string;
}

export default function NavbarClasse({ classeId }: Props) {
  const history = useHistory();
  return (
    <Navbar
      tab={[
        {
          title: "Informations",
          leftIcon: <HiOutlineClipboardList size={20} className="mt-0.5 ml-2.5" />,
          isActive: location.pathname === `/classes/${classeId}`,
          onClick: () => {
            history.push(`/classes/${classeId}`);
          },
        },
        {
          title: "Historique de la classe",
          leftIcon: <LuHistory size={20} className="mt-0.5 ml-2.5" />,
          isActive: location.pathname === `/classes/${classeId}/historique`,
          onClick: () => {
            history.push(`/classes/${classeId}/historique`);
          },
        },
        {
          title: "Historique des inscriptions",
          leftIcon: <LuHistory size={20} className="mt-0.5 ml-2.5" />,
          isActive: location.pathname === `/classes/${classeId}/inscriptions`,
          onClick: () => {
            history.push(`/classes/${classeId}/inscriptions`);
          },
        },
      ]}
    />
  );
}
