import React from "react";
import { HiOutlineClipboardList } from "react-icons/hi";
import cx from "classnames";

import { ROLES, STATUS_CLASSE, YOUNG_STATUS, ClasseFileKeys, ClasseCertificateKeys, ClassesRoutes } from "snu-lib";
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
  classe: NonNullable<ClassesRoutes["GetOne"]["response"]["data"]>;
  setClasse: (classe: NonNullable<ClassesRoutes["GetOne"]["response"]["data"]>) => void;
  isLoading: boolean;
  setIsLoading: (b: boolean) => void;
  url: string;
  id: string;
  studentStatus: any;
  canPerformManualInscriptionActions: boolean;
}

export const getHeaderActionList = ({ user, classe, setClasse, isLoading, setIsLoading, url, id, studentStatus, canPerformManualInscriptionActions }: Props) => {
  const isClasseDeletable = () => {
    if (studentStatus?.[YOUNG_STATUS.VALIDATED] > 0) return false;
    if (classe?.cohesionCenterId) return false;
    if (classe?.sessionId) return false;
    if (classe?.ligneId) return false;
    return true;
  };

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
        ],
      },
    ];
    if (studentStatus?.parentAllowSNU > 0) {
      optionsExport[0].items.push({
        key: "consent",
        render: (
          <ButtonCertificateDownload key="consent" title={"Consentements à la participation (.pdf)"} type={ClasseCertificateKeys.CONSENT} id={id} setIsLoading={setIsLoading} />
        ),
      });
    }
    if (studentStatus?.imageRight > 0) {
      optionsExport[0].items.push({
        key: "image",
        render: <ButtonCertificateDownload key="image" title={"Droits à l'image (.pdf)"} type={ClasseCertificateKeys.IMAGE} id={id} setIsLoading={setIsLoading} />,
      });
    }
    if (studentStatus?.youngWithSession > 0) {
      optionsExport[0].items.push({
        key: "convocation",
        render: (
          <ButtonCertificateDownload key="convocation" title={"Convocations au séjour (.pdf)"} type={ClasseCertificateKeys.CONVOCATION} id={id} setIsLoading={setIsLoading} />
        ),
      });
    }

    if (optionsExport[0].items.length === 0) optionsExport.shift();
    return optionsExport;
  };

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

  const actionsList: React.ReactNode[] = [];

  if (classe?.status === STATUS_CLASSE.CREATED && [ROLES.ADMIN, ROLES.REFERENT_REGION, ROLES.REFERENT_DEPARTMENT].includes(user.role)) {
    actionsList.push(<ButtonRelanceVerif key="relance" classeId={id} onLoading={setIsLoading} />);
  }
  if (classe?.status === STATUS_CLASSE.CREATED && [ROLES.ADMIN, ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(user.role)) {
    actionsList.push(<VerifClassButton key="verify" classe={classe} setClasse={setClasse} isLoading={isLoading} setLoading={setIsLoading} />);
  }

  const isManualInscriptionActionDisabled = !(classe?.status === STATUS_CLASSE.OPEN || canPerformManualInscriptionActions);
  const optionsInscriptionFiltered =
    classe?.status !== STATUS_CLASSE.OPEN && canPerformManualInscriptionActions
      ? [
          {
            ...optionsInscription[0],
            // override items to keep only manual inscription
            items: optionsInscription[0].items.filter((i) => i.key === "manual"),
          },
        ]
      : optionsInscription;

  actionsList.push(
    <DropdownButton
      key="inscription"
      title="Inscrire les élèves"
      type="wired"
      optionsGroup={optionsInscriptionFiltered}
      position="right"
      buttonClassName={cx("mr-2", isManualInscriptionActionDisabled && "cursor-not-allowed")}
      disabled={isManualInscriptionActionDisabled}
      {...(isManualInscriptionActionDisabled && { tooltip: "Les inscriptions sont fermées. Vous n’avez pas les droits pour inscrire un élève." })}
    />,
  );

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

  actionsList.push(<DropdownButton key="export" title="Exporter" optionsGroup={getOptionsExport()} position="right" buttonClassName="mr-2" disabled={isLoading} />);

  if (user.role === ROLES.ADMIN) {
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
