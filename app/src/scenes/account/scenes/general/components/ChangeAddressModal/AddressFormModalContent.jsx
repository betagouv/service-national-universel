import React, { useState } from "react";
import Modal from "../../../../../../components/ui/modals/Modal";
import Input from "../../../../../../components/forms/inputs/Input";
import LocationMarker from "../../../../../../assets/icons/LocationMarker";
import ButtonPrimary from "../../../../../../components/ui/buttons/ButtonPrimary";
import ButtonLight from "../../../../../../components/ui/buttons/ButtonLight";
import useAddress from "@/services/useAddress";

const emptyAddress = { address: "", zip: "", city: "" };

const AddressFormModalContent = ({ onCancel, onConfirm, isLoading }) => {
  const [formValues, setFormValues] = useState(emptyAddress);
  const { results, isError, refetch } = useAddress({
    query: `${formValues.address} ${formValues.zip} ${formValues.city}`,
    options: { limit: 1, postcode: formValues.zip },
    enabled: false,
  });
  const suggestion = results?.[0];
  const [errors, setErrors] = useState({});

  const handleChangeValue = (inputName) => (value) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [inputName]: value,
    }));
  };

  const validateForm = () => {
    const foundErrors = {};
    let hasError = false;
    if (!formValues.address) {
      foundErrors.address = "Ce champ est obligatoire";
      hasError = true;
    }
    if (!formValues.zip) {
      foundErrors.zip = "Ce champ est obligatoire";
      hasError = true;
    }
    if (!formValues.city) {
      foundErrors.city = "Ce champ est obligatoire";
      hasError = true;
    }
    setErrors(foundErrors);
    return !hasError;
  };

  const onAddressVerify = async () => {
    if (!validateForm()) {
      return;
    }
    await refetch();
  };

  const onAddressVerified = (isConfirmed) => async () => {
    const updates = {
      addressVerified: "true",
      cityCode: suggestion.cityCode,
      region: suggestion.region,
      department: suggestion.department,
      location: suggestion.location,
      // if the suggestion is not confirmed we keep the address typed by the user
      address: isConfirmed ? suggestion.address : formValues.address,
      zip: isConfirmed ? suggestion.zip : formValues.zip,
      city: isConfirmed ? suggestion.city : formValues.city,
      country: "France",
    };
    onConfirm(updates);
  };

  return (
    <>
      <Modal.Title>Saisir votre nouvelle adresse</Modal.Title>
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}>
        <Input label="Adresse" name="address" value={formValues.address} onChange={handleChangeValue("address")} error={errors.address} />
        <Input label="Code Postal" name="zip" value={formValues.zip} onChange={handleChangeValue("zip")} error={errors.zip} />
        <Input label="Ville" name="city" value={formValues.city} onChange={handleChangeValue("city")} error={errors.city} />
        <Modal.Buttons
          isLoading={isLoading}
          onCancel={onCancel}
          onConfirm={onAddressVerify}
          cancelText="Annuler"
          confirmText={
            <>
              <LocationMarker />
              <span>Vérifier mon adresse</span>
            </>
          }
        />

        {!suggestion && (
          <div className="flex justify-center">
            <div className="text-sm text-red-500 flex-1 pr-2">L&apos;adresse saisie n&apos;a pas été trouvée.</div>
            <ButtonLight onClick={() => setFormValues(emptyAddress)}>Réessayer</ButtonLight>
          </div>
        )}

        {isError && (
          <div className="flex justify-center">
            <div className="text-sm text-red-500 flex-1 pr-2">Une erreur est survenue lors de la recherche de l&apos;adresse.</div>
            <ButtonLight onClick={() => setFormValues(emptyAddress)}>Réessayer</ButtonLight>
          </div>
        )}

        {suggestion && (
          <>
            <div className="text-sm text-gray-500">Est-ce que c’est la bonne adresse ?</div>
            <strong className="text-sm font-medium text-gray-900">
              {suggestion.address}, {`${suggestion.zip} ${suggestion.city}`}
            </strong>
            <Modal.ButtonContainer className="md:flex-col">
              <ButtonPrimary onClick={onAddressVerified(true)} disabled={isLoading}>
                Oui
              </ButtonPrimary>
              <ButtonLight disabled={isLoading} onClick={onAddressVerified()}>{`Non, garder "${formValues.address}, ${formValues.zip} ${formValues.city}"`}</ButtonLight>
              <ButtonLight onClick={onCancel}>Annuler</ButtonLight>
            </Modal.ButtonContainer>
          </>
        )}
      </form>
    </>
  );
};

export default AddressFormModalContent;
