import React, { useState } from "react";
import ModalServiceDepartment from "../modal/ModalServiceDepartment";
import { toastr } from "react-redux-toastr";
import api from "../../../../services/api";
import { translate } from "../../../../utils";
import timbre from "../../../../assets/timbre.svg";

export default function CardDepartement({ servicesDep, department, getService }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleShowModal = () => setIsOpen(true);
  const handleSubmit = async (value) => {
    try {
      value.department = department;
      const { ok, data } = await api.post("/department-service", value);
      if (!ok) return toastr.error("Une erreur s'est produite lors de la mise a jour du service départemental");
      toastr.success("Le service départemental a été mis à jour ");
      await getService();
      setIsOpen(false);
    } catch (e) {
      return toastr.error("Oups, une erreur est survenue lors de la mise a jour du service départemental : ", translate(e.code));
    }
  };
  if (!servicesDep) return null;
  return (
    <div className="rounded-lg bg-white shadow-sm mr-4 hover:cursor-pointer hover:scale-105" onClick={handleShowModal}>
      <div className=" flex flex-row">
        <div className="flex flex-col pl-7 py-6">
          <div className="text-bold text-sm mb-1">Service départemental</div>
          <div className="text-gray-500 text-xs">{servicesDep.directionName}</div>
          <div className="text-gray-500 text-xs">{servicesDep.address},</div>
          <div className="text-gray-500 text-xs">{servicesDep.complementAddress}</div>
          <div className="text-gray-500 text-xs">
            {servicesDep.city}, {servicesDep.zip}
          </div>
        </div>
        <div className="flex flex-col">
          <img src={timbre} alt="timbre" className="w-20 h-16" />
        </div>
      </div>
      <ModalServiceDepartment isOpen={isOpen} setIsOpen={setIsOpen} onSubmit={(data) => handleSubmit(data)} servicesDep={servicesDep} />
    </div>
  );
}
