import React from "react";
import { HiOutlineClipboardList } from "react-icons/hi";

import { ROLES, STATUS_CLASSE, YOUNG_STATUS, ClasseDto, ClasseFileKeys } from "snu-lib";
import { User } from "@/types";
import { DropdownButton } from "@snu/ds/admin";

import ButtonRelanceVerif from "./ButtonRelanceVerif";
import VerifClassButton from "./VerifClassButton";
import ButtonManualInvite from "./ButtonManualInvite";
import ButtonLinkInvite from "./ButtonLinkInvite";
import ButtonHandleInscription from "./ButtonHandleInscription";
import ButtonDownloadEmptyFile from "./ButtonDownloadEmptyFile";
import ButtonCertificateDownload from "./ButtonCertificateDownload";
import DeleteButton from "./DeleteButton";

interface Props {
  user: User;
  classe: ClasseDto;
  setClasse: (classe: ClasseDto) => void;
  isLoading: boolean;
  setIsLoading: (b: boolean) => void;
  url: string;
  id: string;
  studentStatus: any;
}

export const getHeaderActionList = ({ user, classe, setClasse, isLoading, setIsLoading, url, id, studentStatus }: Props) => {
  const isClasseDeletable = () => {
    if (studentStatus?.[YOUNG_STATUS.VALIDATED] > 0) return false;
    if (classe?.cohesionCenterId) return false;
    if (classe?.sessionId) return false;
    if (classe?.ligneId) return false;
    return true;
  };
  const actionsList: React.ReactNode[] = [];

  if (classe?.status === STATUS_CLASSE.CREATED && [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role)) {
    actionsList.push(<ButtonRelanceVerif key="relance" classeId={id} onLoading={setIsLoading} />);
  }
  if (classe?.status === STATUS_CLASSE.CREATED && [ROLES.ADMIN, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role)) {
    actionsList.push(<VerifClassButton key="verify" classe={classe} setClasse={setClasse} isLoading={isLoading} setLoading={setIsLoading} />);
  }
  if (classe?.status && STATUS_CLASSE.OPEN === classe.status) {
    const optionsInscription = [
      {
        key: "inscription",
        title: "Inscrire les élèves",
        items: [
          {
            key: "link",
            render: <ButtonLinkInvite key="invite" url={url} />,
          },
          {
            key: "manual",
            render: <ButtonManualInvite key="manual" id={id} />,
          },
        ],
      },
    ];
    actionsList.push(<DropdownButton key="inscription" title="Inscrire les élèves" type="wired" optionsGroup={optionsInscription} position="right" buttonClassName="mr-2" />);
  }
  if (classe?.status && (classe.status === STATUS_CLASSE.OPEN || classe.status === STATUS_CLASSE.CLOSED) && [ROLES.REFERENT_CLASSE, ROLES.ADMINISTRATEUR_CLE].includes(user.role)) {
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
          key: "imageVierge",
          render: <ButtonDownloadEmptyFile key="imageVierge" title="Formulaire du droit à l'image (.pdf)" type={ClasseFileKeys.IMAGE} setIsLoading={setIsLoading} />,
        },
        {
          key: "reglement",
          render: <ButtonDownloadEmptyFile key="reglement" title="Règlement intérieur (.pdf)" type={ClasseFileKeys.REGLEMENT} setIsLoading={setIsLoading} />,
        },
        {
          key: "consentData",
          render: <ButtonDownloadEmptyFile key="consentData" title="Formulaire protection des données (.pdf)" type={ClasseFileKeys.CONSENT_DATA} setIsLoading={setIsLoading} />,
        },
      ],
    },
  ];
  if (studentStatus?.parentAllowSNU > 0) {
    optionsExport[0].items.push({
      key: "consent",
      render: (
        <button type="button" className="flex items-center justify-start w-full text-sm leading-5 font-normal">
          Consentements à la participation (.pdf)
        </button>
      ),
    });
  }
  if (studentStatus?.imageRight > 0) {
    optionsExport[0].items.push({
      key: "image",
      render: (
        <button type="button" className="flex items-center justify-start w-full text-sm leading-5 font-normal">
          Droits à l'image (.pdf)
        </button>
      ),
    });
  }
  if (studentStatus?.[YOUNG_STATUS.VALIDATED] > 0) {
    optionsExport[0].items.push({
      key: "convocation",
      render: <ButtonCertificateDownload key="convocation" id={id} />,
    });
  }

  if (optionsExport[0].items.length === 0) optionsExport.shift();

  actionsList.push(<DropdownButton key="export" title="Exporter" optionsGroup={optionsExport} position="right" buttonClassName="mr-2" />);

  if (user.role === ROLES.ADMIN) {
    const optionsAdmin = [
      {
        key: "actions",
        title: "Actions",
        items: [
          {
            key: "edit1",
            render: classe && <DeleteButton classe={classe} onLoading={setIsLoading} />,
          },
        ],
      },
    ];
    actionsList.push(
      <DropdownButton
        key="edit"
        type="secondary"
        title="Actions"
        optionsGroup={optionsAdmin}
        position="right"
        tooltip="Vous ne pouvez pas supprimer une classe si des élèves sont validés, ou si la classe est affectée à un centre."
        disabled={!isClasseDeletable()}
      />,
    );
  }
  return actionsList;
};
