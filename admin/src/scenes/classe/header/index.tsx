import React from "react";
import { HiOutlineClipboardList } from "react-icons/hi";

import { ROLES, STATUS_CLASSE, ClasseFileKeys, ClassesRoutes } from "snu-lib";
import { User } from "@/types";
import { DropdownButton } from "@snu/ds/admin";

import ButtonHandleInscription from "./ButtonHandleInscription";
import ButtonDownloadEmptyFile from "./ButtonDownloadEmptyFile";

interface Props {
  user: User;
  classe: NonNullable<ClassesRoutes["GetOne"]["response"]["data"]>;
  setClasse: (classe: NonNullable<ClassesRoutes["GetOne"]["response"]["data"]>) => void;
  isLoading: boolean;
  setIsLoading: (b: boolean) => void;
  id: string;
  studentStatus: any;
  canPerformManualInscriptionActions: boolean;
}

export const getHeaderActionList = ({ user, classe, setIsLoading, id, studentStatus }: Props) => {
  const getOptionsExport = () => {
    const optionsExport = [
      {
        key: "export1",
        title: "Exporter les attestations nominatives",
        items: [],
      },
      {
        key: "export2",
        title: "Exporter un formulaire vierge",
        items: [
          {
            key: "inscriptionVierge",
            render: <ButtonDownloadEmptyFile key="inscriptionVierge" title="Formulaire d'inscription (.pdf)" type={ClasseFileKeys.INSCRIPTION} setIsLoading={setIsLoading} />,
          },
          {
            key: "consentVierge",
            render: <ButtonDownloadEmptyFile key="consentVierge" title="Formulaire de consentement (.pdf)" type={ClasseFileKeys.CONSENT} setIsLoading={setIsLoading} />,
          },
          {
            key: "reglement",
            render: <ButtonDownloadEmptyFile key="reglement" title="Règlement intérieur (.pdf)" type={ClasseFileKeys.REGLEMENT} setIsLoading={setIsLoading} />,
          },
          {
            key: "sanitaire",
            render: <ButtonDownloadEmptyFile key="sanitaire" title="Fiche sanitaire (.pdf)" type={ClasseFileKeys.SANITAIRE} setIsLoading={setIsLoading} />,
          },
        ],
      },
    ];

    if (optionsExport[0].items.length === 0) optionsExport.shift();
    return optionsExport;
  };

  const optionsInscriptionHandler = [
    {
      key: "inscriptionHandler",
      title: "Gérer les inscriptions",
      items: [
        {
          key: "consent",
          render: <ButtonHandleInscription key="consent" title="Récolter les consentements" type="consent" id={id} />,
        },
        {
          key: "validation",
          render: <ButtonHandleInscription key="validation" title="Valider les inscriptions" type="validation" id={id} />,
        },
        {
          key: "image",
          render: <ButtonHandleInscription key="image" title="Récolter les droits à l'image" type="image" id={id} />,
        },
      ],
    },
  ];

  const actionsList: React.ReactNode[] = [];

  if (classe?.status && (classe.status === STATUS_CLASSE.OPEN || classe.status === STATUS_CLASSE.CLOSED) && [ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(user.role)) {
    actionsList.push(
      <DropdownButton
        key="inscriptionHandler"
        title="Gérer les inscriptions"
        optionsGroup={optionsInscriptionHandler}
        position="right"
        buttonClassName="mr-2"
        icon={<HiOutlineClipboardList size={20} className="mt-1" />}
      />,
    );
  }

  return actionsList;
};
