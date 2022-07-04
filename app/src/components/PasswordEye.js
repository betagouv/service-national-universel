import React, { useState } from "react";
import { Field } from "formik";
import styled from "styled-components";
import { getPasswordErrorMessage } from "../utils";

import EyeOpen from "../assets/eye.svg";
import EyeClose from "../assets/eye-slash.svg";

// eslint-disable-next-line prettier/prettier
export default function PasswordEye({
  value,
  onChange,
  showError = true,
  autoComplete = "new-password",
  placeholder = "Tapez votre mot de passe",
  name = "password",
  validate = () => {},
}) {
  const [passwordText, setPasswordText] = useState(false);

  return (
    <ContainerPassword>
      <InputField
        placeholder={placeholder}
        className="form-control"
        validate={(v) => validate(v) || (showError && getPasswordErrorMessage(v))}
        type={passwordText ? "text" : "password"}
        autoComplete={autoComplete}
        name={name}
        value={value}
        onChange={onChange}
      />
      <EyeIcon src={passwordText ? EyeClose : EyeOpen} onClick={() => setPasswordText(!passwordText)} />
    </ContainerPassword>
  );
}

const ContainerPassword = styled.div`
  position: relative;
  input {
    padding-right: 40px !important;
  }
`;

const EyeIcon = styled.img`
  position: absolute;
  right: 15px;
  top: 47%;
  width: 25px;
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
  padding: 21px 20px;
  border-radius: 4px;
  border: 1px solid;
  border-color: ${({ hasError }) => (hasError ? "red" : "#dcdfe6")};
  ::placeholder {
    color: #798fb0;
  }
  :focus {
    border: 1px solid #aaa;
    ::placeholder {
      color: #ccd5e0;
    }
  }
`;
