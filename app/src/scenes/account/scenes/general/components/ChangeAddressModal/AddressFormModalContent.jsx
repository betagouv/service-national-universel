import React, { useState } from "react";
import Modal from "../../../../../../components/ui/modals/Modal";
import ButtonPrimary from "../../../../../../components/ui/buttons/ButtonPrimary";
import ButtonLight from "../../../../../../components/ui/buttons/ButtonLight";
import AddressForm from "@/components/dsfr/forms/AddressForm";

const AddressFormModalContent = ({ onCancel, onConfirm, isLoading }) => {
  const [data, setData] = useState({});
  if (isLoading) {
    return <p className="animate-pulse text-center">Chargement</p>;
  }
  return (
    <>
      <Modal.Title>Saisir votre nouvelle adresse</Modal.Title>
      <AddressForm data={data} updateData={setData} />
      <div className="flex justify-end gap-2 mt-4">
        <ButtonLight onClick={onCancel}>Annuler</ButtonLight>
        <ButtonPrimary onClick={() => onConfirm(data)} disabled={!data.address}>
          Confirmer
        </ButtonPrimary>
      </div>
    </>
  );
};

export default AddressFormModalContent;
