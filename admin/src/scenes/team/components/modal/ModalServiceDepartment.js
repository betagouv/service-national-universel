import React, { useState } from "react";
import { Footer } from "../../../../components/modals/Modal";
import ModalForm from "../../../../components/modals/ModalForm";
import ModalButton from "../../../../components//buttons/ModalButton";

export default function ModalServiceDepartment({ isOpen, setIsOpen, onSubmit, servicesDep }) {
  const onCancel = () => setIsOpen(false);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState({
    directionName: servicesDep.directionName,
    address: servicesDep.address,
    complementAddress: servicesDep.complementAddress,
    city: servicesDep.city,
    zip: servicesDep.zip,
  });

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    await onSubmit(data);
    setIsLoading(false);
  };

  return (
    <ModalForm isOpen={isOpen} headerText={`Service départemental ${servicesDep.department}`} onCancel={onCancel} classNameModal="max-w-3xl">
      <form className="w-full" onSubmit={handleSubmit}>
        <div className="flex flex-col items-center justify-center p-8 ">
          <div className="w-full flex flex-row  justify-center ">
            <div className="w-full flex flex-col m-2">
              <div className={`border-[1px] rounded-lg w-full m-2 py-1 px-2 ${isLoading && "bg-gray-200"}`}>
                <label htmlFor="directionName" className="text-left text-gray-500 w-full">
                  <span className="text-red-400">*</span>&nbsp;Nom de la Direction
                </label>
                <input
                  required
                  disabled={isLoading}
                  className="w-full disabled:bg-gray-200"
                  name="directionName"
                  id="directionName"
                  onChange={handleChange}
                  value={data.directionName}
                />
              </div>

              <div className={`border-[1px] rounded-lg w-full m-2 py-1 px-2 ${isLoading && "bg-gray-200"}`}>
                <label htmlFor="complementAddress" className="text-left text-gray-500 w-full">
                  Complément d’adresse
                </label>
                <input
                  disabled={isLoading}
                  className="w-full disabled:bg-gray-200"
                  name="complementAddress"
                  id="complementAddress"
                  onChange={handleChange}
                  value={data.complementAddress}
                />
              </div>

              <div className={`border-[1px] rounded-lg w-full m-2 py-1 px-2 ${isLoading && "bg-gray-200"}`}>
                <label htmlFor="city" className="text-left text-gray-500 w-full">
                  <span className="text-red-400">*</span>&nbsp;Ville
                </label>
                <input required disabled={isLoading} className="w-full disabled:bg-gray-200" name="city" id="city" onChange={handleChange} value={data.city} />
              </div>
            </div>
            <div className="w-full flex flex-col m-2">
              <div className={`border-[1px] rounded-lg w-full m-2 py-1 px-2 ${isLoading && "bg-gray-200"}`}>
                <label htmlFor="address" className="text-left text-gray-500 w-full">
                  <span className="text-red-400">*</span>&nbsp;Adresse
                </label>
                <input required disabled={isLoading} className="w-full disabled:bg-gray-200" name="address" id="address" onChange={handleChange} value={data.address} />
              </div>

              <div className={`border-[1px] rounded-lg w-full m-2 py-1 px-2 ${isLoading && "bg-gray-200"}`}>
                <label htmlFor="zip" className="text-left text-gray-500 w-full">
                  <span className="text-red-400">*</span>&nbsp;Code postal
                </label>
                <input required disabled={isLoading} className="w-full disabled:bg-gray-200" name="zip" id="zip" onChange={handleChange} value={data.zip} />
              </div>
            </div>
          </div>
        </div>
        <Footer>
          <ModalButton disabled={isLoading} type="submit" primary>
            Enregistrer
          </ModalButton>
          <ModalButton onClick={onCancel}>Annuler</ModalButton>
        </Footer>
      </form>
    </ModalForm>
  );
}
