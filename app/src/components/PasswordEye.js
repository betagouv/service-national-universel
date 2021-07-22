import React, { useState } from "react";
import { Field } from "formik";
import styled from "styled-components";
import passwordValidator from "password-validator";

import EyeOpen from "../assets/eye.svg";
import EyeClose from "../assets/eye-slash.svg";

export default ({ value, onChange }) => {
  const [passwordText, setPasswordText] = useState(false);

  function getPasswordErrorMessage(v) {
    if (!v) return "Ce champ est obligatoire";
    const schema = new passwordValidator();
    schema
      .is()
      .min(12) // Minimum length 12
      .has()
      .uppercase() // Must have uppercase letters
      .has()
      .lowercase() // Must have lowercase letters
      .has()
      .digits() // Must have digits
      .has()
      .symbols(); // Must have symbols

    if (!schema.validate(v)) {
      return "Votre mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole";
    }
  }

  return (
    <ContainerPassword>
      <InputField
        placeholder="Tapez votre mot de passe"
        className="form-control"
        validate={(v) => getPasswordErrorMessage(v)}
        type={passwordText ? "text" : "password"}
        name="password"
        value={value}
        onChange={onChange}
      />
      <EyeIcon src={passwordText ? EyeClose : EyeOpen} onClick={() => setPasswordText(!passwordText)} />
    </ContainerPassword>
  );
};

const ContainerPassword = styled.div`
  position: relative;
  input {
    padding-right: 40px !important;
  }
`;

const EyeIcon = styled.img`
  position: absolute;
  right: 15px;
  top: 50%;
  height: 18px;
  opacity: 0.7;
  transform: translateY(-50%);
  font-size: 18px;
  cursor: pointer;
`;

const InputField = styled(Field)`
  display: block;
  width: 100%;
  margin-bottom: 0.375rem;
  background-color: #fff;
  color: #606266;
  outline: 0;
  padding: 9px 20px;
  border-radius: 4px;
  border: 1px solid;
  border-color: ${({ hasError }) => (hasError ? "red" : "#dcdfe6")};
  ::placeholder {
    color: #d6d6e1;
  }
  :focus {
    border: 1px solid #aaa;
  }
`;
