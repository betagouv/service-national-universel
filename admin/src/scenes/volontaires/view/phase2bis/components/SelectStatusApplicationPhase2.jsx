import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import api from "../../../../../services/api";
import ModalConfirm from "../../../../../components/modals/ModalConfirm";
import ModalConfirmWithMessage from "../../../../../components/modals/ModalConfirmWithMessage";
import { APPLICATION_STATUS, ROLES, colors, SENDINBLUE_TEMPLATES, translate, translateApplication } from "snu-lib";
import { BiChevronDown } from "react-icons/bi";

export const SelectStatusApplicationPhase2 = ({ hit, options = [], callback, dropdownClassName = "" }) => {
  const [application, setApplication] = useState(null);
  const [modalConfirm, setModalConfirm] = useState({ isOpen: false, onConfirm: null });
  const [modalRefuse, setModalRefuse] = useState({ isOpen: false, onConfirm: null });
  const [modalDone, setModalDone] = useState({ isOpen: false, onConfirm: null });
  const [dropDownOpen, setDropDownOpen] = useState(false);
  const ref = React.useRef(null);

  const user = useSelector((state) => state.Auth.user);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setDropDownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  const theme = {
    background: {
      WAITING_VALIDATION: "blue-100",
      WAITING_VERIFICATION: "blue-100",
      WAITING_ACCEPTATION: "orange-500",
      VALIDATED: "[#71C784]",
      DONE: "blue-500",
      REFUSED: "blue-800",
      CANCEL: "gray-100",
      IN_PROGRESS: "indigo-600",
      ABANDON: "gray-50",
    },
    text: {
      WAITING_VALIDATION: "blue-600",
      WAITING_VERIFICATION: "blue-600",
      WAITING_ACCEPTATION: "white",
      VALIDATED: "white",
      DONE: "white",
      REFUSED: "white",
      CANCEL: "gray-500",
      IN_PROGRESS: "white",
      ABANDON: "gray-400",
    },
  };

  const fetchApplication = async () => {
    try {
      const id = hit && hit._id;
      if (!id) return setApplication(null);
      const { data, ok } = await api.get(`/application/${id}`);
      if (!ok) return setApplication(null);
      setApplication(data);
    } catch (error) {
      console.log(error);
      toastr.error("Oups, une erreur est survenue lors de la récupération du statut de la candidature", translate(error.code));
    }
  };
  useEffect(() => {
    fetchApplication();
  }, [hit._id]);

  if (!application) return <i style={{ color: colors.darkPurple }}>Chargement...</i>;

  options = lookUpAuthorizedStatus({ status: application.status, role: user.role });

  const onClickStatus = (status) => {
    setDropDownOpen(false);
    setModalConfirm({
      isOpen: true,
      title: "Êtes-vous sûr(e) de vouloir modifier le statut de cette candidature?\nUn email sera automatiquement envoyé.",
      onConfirm: () => handleClickStatus(status),
    });
  };

  const handleClickStatus = (status) => {
    if (status === APPLICATION_STATUS.REFUSED) setModalRefuse({ isOpen: true });
    else if (status === APPLICATION_STATUS.DONE) setModalDone({ isOpen: true });
    else setStatus(status);
  };

  const setStatus = async (status, message, duration) => {
    try {
      const { ok, code, data } = await api.put("/application", { _id: application._id, status, missionDuration: duration });
      if (!ok) return toastr.error("Une erreur s'est produite :", translate(code));
      setApplication(data);
      toastr.success("Mis à jour!");
      if (status === APPLICATION_STATUS.VALIDATED) {
        await api.post(`/application/${data._id}/notify/${SENDINBLUE_TEMPLATES.referent.YOUNG_VALIDATED}`);
        await api.post(`/application/${data._id}/notify/${SENDINBLUE_TEMPLATES.young.VALIDATE_APPLICATION}`);
      } else if (status === APPLICATION_STATUS.CANCEL) {
        await api.post(`/application/${data._id}/notify/${SENDINBLUE_TEMPLATES.referent.CANCEL_APPLICATION}`, { message });
      } else if (status === APPLICATION_STATUS.REFUSED) {
        await api.post(`/application/${data._id}/notify/${SENDINBLUE_TEMPLATES.young.REFUSE_APPLICATION}`, { message });
      }
      callback && callback(status);
    } catch (e) {
      console.log(e);
      if (e.code !== "NO_TEMPLATE_FOUND") toastr.error("Oups, une erreur est survenue :", translate(e.code));
    }
  };

  return (
    <>
      <div ref={ref} className={`relative ${options.length > 1 && "cursor-pointer"}`}>
        <div className="inline-block" onClick={() => setDropDownOpen((dropDownOpen) => !dropDownOpen)}>
          <div className={`bg-${theme.background[application.status]} text-${theme.text[application.status]} flex flex-row items-center rounded`}>
            <div className="p-1 text-xs font-normal">{translateApplication(application.status)}</div>
            {options.length >= 1 && <BiChevronDown size={20} />}
          </div>
        </div>
        {dropDownOpen && (
          <div className={"absolute z-10 bg-white " + dropdownClassName}>
            {options
              .filter((e) => e !== application.status)
              .map((status) => {
                return (
                  <div key={status} className="dropdown-item" onClick={() => onClickStatus(status)}>
                    {translateApplication(status)}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      <ModalConfirmWithMessage
        isOpen={modalRefuse.isOpen}
        title="Veuillez éditer le message ci-dessous pour préciser les raisons du refus avant de l'envoyer"
        message={`Une fois le message ci-dessous validé, il sera transmis par mail à ${application.youngFirstName} (${application.youngEmail}).`}
        onChange={() => setModalRefuse({ isOpen: false, onConfirm: null })}
        onConfirm={(msg) => {
          setStatus(APPLICATION_STATUS.REFUSED, msg);
          setModalRefuse({ isOpen: false, onConfirm: null });
        }}
      />
      <ModalConfirmWithMessage
        isOpen={modalDone.isOpen}
        title="Validation de réalisation de mission"
        message={`Merci de valider le nombre d'heures effectuées par ${application.youngFirstName} pour la mission ${application.missionName}.`}
        onChange={() => setModalDone({ isOpen: false, onConfirm: null })}
        type="missionduration"
        defaultInput={application.missionDuration}
        placeholder="Nombre d'heures"
        onConfirm={(duration) => {
          setStatus(APPLICATION_STATUS.DONE, null, duration);
          setModalDone({ isOpen: false, onConfirm: null });
        }}
      />
      <ModalConfirm
        isOpen={modalConfirm?.isOpen}
        title={modalConfirm?.title}
        message={modalConfirm?.message}
        onCancel={() => setModalConfirm({ isOpen: false, onConfirm: null })}
        onConfirm={() => {
          modalConfirm?.onConfirm();
          setModalConfirm({ isOpen: false, onConfirm: null });
        }}
      />
    </>
  );
};
const lookUpAuthorizedStatus = ({ status, role }) => {
  if ([ROLES.ADMIN, ROLES.REFERENT_DEPARTMENT, ROLES.REFERENT_REGION].includes(role)) {
    return [
      APPLICATION_STATUS.WAITING_ACCEPTATION,
      APPLICATION_STATUS.WAITING_VERIFICATION,
      APPLICATION_STATUS.WAITING_VALIDATION,
      APPLICATION_STATUS.VALIDATED,
      APPLICATION_STATUS.IN_PROGRESS,
      APPLICATION_STATUS.DONE,
      APPLICATION_STATUS.CANCEL,
      APPLICATION_STATUS.ABANDON,
      APPLICATION_STATUS.REFUSED,
    ];
  } else {
    switch (status) {
      case APPLICATION_STATUS.WAITING_ACCEPTATION:
        return [APPLICATION_STATUS.REFUSED];
      case APPLICATION_STATUS.WAITING_VALIDATION:
        return [APPLICATION_STATUS.VALIDATED, APPLICATION_STATUS.REFUSED];
      case APPLICATION_STATUS.VALIDATED:
        return [APPLICATION_STATUS.IN_PROGRESS, APPLICATION_STATUS.DONE, APPLICATION_STATUS.ABANDON, APPLICATION_STATUS.REFUSED];
      case APPLICATION_STATUS.IN_PROGRESS:
        return [APPLICATION_STATUS.DONE, APPLICATION_STATUS.ABANDON];
      case APPLICATION_STATUS.WAITING_VERIFICATION:
        return [APPLICATION_STATUS.REFUSED, APPLICATION_STATUS.VALIDATED];
      case APPLICATION_STATUS.REFUSED:
        return [APPLICATION_STATUS.VALIDATED];
      case APPLICATION_STATUS.CANCEL:
      case APPLICATION_STATUS.DONE:
      case APPLICATION_STATUS.ABANDON:
      default:
        return [];
    }
  }
};
