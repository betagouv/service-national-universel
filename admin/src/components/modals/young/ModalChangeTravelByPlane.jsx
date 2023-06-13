import React, { useState } from "react";
import ModalPrimary from "../../ui/modals/ModalPrimary";
import { updateYoungTravelingByPlane } from "../../../services/young.service";
import { toastr } from "react-redux-toastr";

const ModalChangeTravelByPlane = ({ young, value, onConfirm, onLoading, ...rest }) => {
  const [isLoading, setIsLoading] = useState(false);

  const getTitle = () => {
    if (value === "true") return `Marquer ${young.firstName} comme voyageant en avion.`;
    if (value === "false") return `Marquer ${young.firstName} comme ne voyageant pas en avion.`;
    return `Marquer le voyage en avion de ${young.firstName} en non renseigné`;
  };
  const getMessage = () => {
    if (value === "true") return `Vous êtes sur le point de marquer ${young.firstName} comme voyageant en avion.`;
    if (value === "false") return `Vous êtes sur le point de marquer ${young.firstName} comme ne voyageant pas en avion.`;
    return `Vous êtes sur le point de marquer le voyage en avion de ${young.firstName} en non renseigné.`;
  };

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      onLoading(true);
      const { data } = await updateYoungTravelingByPlane({ youngId: young._id, value });
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

export default ModalChangeTravelByPlane;
