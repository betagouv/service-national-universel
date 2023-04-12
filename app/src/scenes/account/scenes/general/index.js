import React from "react";
import InputText from "../../../../components/forms/inputs/InputText";
import Select from "../../../../components/forms/inputs/Select";

const AccountGeneralPage = () => {
  return (
    <div className="bg-white shadow px-4 py-6">
      <form>
        <h2 className="text-xs font-medium text-gray-900 m-0 mb-2">Identité et contact</h2>
        <InputText label="Nom" name="lastName" placeholder="Dupond" />
        <InputText label="Prénom" name="firstName" placeholder="Gaspard" />
        <Select label="Sexe" name="gender">
          <option value="homme">Homme</option>
          <option value="femme">Femme</option>
        </Select>
      </form>
    </div>
  );
};

export default AccountGeneralPage;
