import React, { useState } from "react";
import ModalPrimary from "../../ui/modals/ModalPrimary";
import { updateYoungStayPresenceOnArrival } from "../../../services/young.service";
import { toastr } from "react-redux-toastr";

const ModalChangePresenceOnArrival = ({ young, value, onConfirm, onLoading, ...rest }) => {
  const [isLoading, setIsLoading] = useState(false);

  const getTitle = () => {
    if (value === "true") return `Marquer ${young.firstName} présent(e)`;
    if (value === "false") return `Marquer ${young.firstName} absent(e)`;
    return "Marquer la présence en non renseigné";
  };

  const getMessage = () => {
    if (value === "true") return `Vous êtes sur le point de marquer ${young.firstName} présent(e) au séjour de cohésion.`;
    if (value === "false") return `Vous êtes sur le point de marquer ${young.firstName} absent(e) au séjour de cohésion.`;
    return `Vous êtes sur le point de marquer la présence de ${young.firstName} au séjour de cohésion en non renseigné.`;
  };

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      onLoading(true);
      const { data } = await updateYoungStayPresenceOnArrival({ youngId: young._id, value });
      onConfirm(data);
    } catch (error) {
      const { title, message } = error;
      toastr.error(title, message);
    } finally {
      setIsLoading(false);
      onLoading(false);
    }
  };

  return <ModalPrimary title={getTitle()} message={getMessage()} {...rest} isLoading={isLoading} onConfirm={handleConfirm} />;
};

export default ModalChangePresenceOnArrival;
