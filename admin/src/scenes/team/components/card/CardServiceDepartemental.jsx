import React, { useState } from "react";
import ModalServiceDepartment from "../modal/ModalServiceDepartment";
import { toastr } from "react-redux-toastr";
import api from "../../../../services/api";
import { translate } from "snu-lib";
import timbre from "../../../../assets/timbre.svg";

export default function CardDepartement({ servicesDep, department, getService }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleShowModal = () => setIsOpen(true);
  const handleSubmit = async (value) => {
    try {
      value.department = department;
      const { ok } = await api.post("/department-service", value);
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
    <div className="mr-4 min-w-[300px] max-w-[400px] rounded-lg bg-white shadow-sm hover:scale-105 hover:cursor-pointer" onClick={handleShowModal}>
      <div className="flex flex-row justify-between">
        <div className="flex flex-col py-6 pl-7">
          <div className="mb-1 text-sm font-bold">Service départemental</div>
          <div className="text-xs text-gray-500">{servicesDep.directionName}</div>
          <div className="text-xs text-gray-500">{servicesDep.address}</div>
          <div className="text-xs text-gray-500">{servicesDep.complementAddress}</div>
          <div className="text-xs text-gray-500">
            {servicesDep.city}, {servicesDep.zip}
          </div>
        </div>
        <div className="flex flex-col">
          <img src={timbre} alt="timbre" className="h-16 w-20" />
        </div>
      </div>
      <ModalServiceDepartment isOpen={isOpen} setIsOpen={setIsOpen} onSubmit={(data) => handleSubmit(data)} servicesDep={servicesDep} />
    </div>
  );
}
