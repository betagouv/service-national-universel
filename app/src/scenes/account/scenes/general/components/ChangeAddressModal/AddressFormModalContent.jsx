import React, { useState } from "react";
import Modal from "../../../../../../components/ui/modals/Modal";
import ButtonPrimary from "../../../../../../components/ui/buttons/ButtonPrimary";
import ButtonLight from "../../../../../../components/ui/buttons/ButtonLight";
import { useDebounce } from "@uidotdev/usehooks";
import useAddress from "@/services/useAddress";
import { AddressForm } from "@snu/ds/common";

const AddressFormModalContent = ({ onCancel, onConfirm, isLoading }) => {
  const [data, setData] = useState({});
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);
  const { results } = useAddress({ query: debouncedQuery, options: { limit: 10 }, enabled: debouncedQuery.length > 2 });

  if (isLoading) {
    return <p className="animate-pulse text-center">Chargement</p>;
  }
  return (
    <>
      <Modal.Title>Saisir votre nouvelle adresse</Modal.Title>
      <AddressForm data={data} updateData={setData} query={query} setQuery={setQuery} options={results} />
      <div className="flex justify-end gap-2 mt-4">
        <ButtonLight onClick={onCancel}>Annuler</ButtonLight>
        <ButtonPrimary onClick={() => onConfirm(data)} disabled={!data?.address}>
          Confirmer
        </ButtonPrimary>
      </div>
    </>
  );
};

export default AddressFormModalContent;
