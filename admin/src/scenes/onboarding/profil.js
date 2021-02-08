import React from "react";
import { Input } from "reactstrap";
import styled from "styled-components";
import validator from "validator";
import { Formik, Field } from "formik";
import { toastr } from "react-redux-toastr";
import { useDispatch, useSelector } from "react-redux";

import { setUser } from "../../redux/auth/actions";
import api from "../../services/api";

export default ({ onChange }) => {

  const user = useSelector((state) => state.Auth.user);

  const dispatch = useDispatch();
  return (
    <Wrapper>
      <Title>Mon profil</Title>
      <Formik
        initialValues={{ mobile: "", phone: "" }}
        onSubmit={async (values, actions) => {
          try {
            console.log("NEXT")
            // const { data, ok } = await api.put("/referent", values);
            // if (ok) dispatch(setUser(data));
            return onChange("structure");
          } catch (e) {
            toastr.error("Erreur");
          }
          actions.setSubmitting(false);
        }}
      >
        {({ values, errors, handleChange, handleSubmit }) => {
          return (
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <label>
                  <span>*</span>TÉLÉPHONE MOBILE
                </label>
                <Field
                  validate={(v) => !validator.isMobilePhone(v) && "Le numéro n'est pas valide"}
                  name="mobile"
                  type="tel"
                  value={values.mobile}
                  onChange={handleChange}
                  placeholder="Téléphone mobile"
                  hasError={errors.mobile}
                />
                <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.mobile}</p>
              </FormGroup>
              <FormGroup>
                <label>TÉLÉPHONE FIXE</label>
                <Input placeholder="Téléphone fixe" name="phone" value={values.phone} onChange={handleChange} />
              </FormGroup>
              <Button type="submit" onClick={handleSubmit}>
                Continuer
              </Button>
            </form>
          );
        }}
      </Formik>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  padding: 50px;
  max-width: 520px;
`;

const FormGroup = styled.div`
  margin-bottom: 25px;
  label {
    font-size: 11px;
    font-weight: 500;
    text-transform: uppercase;
    color: #6a6f85;
    display: block;
    margin-bottom: 10px;
    span {
      color: red;
      font-size: 10px;
      margin-right: 5px;
    }
  }
  input {
    display: block;
    width: 100%;
    background-color: #fff;
    color: #606266;
    border: 0;
    outline: 0;
    padding: 11px 20px;
    border-radius: 6px;
    margin-right: 15px;
    border: 1px solid #dcdfe6;
    ::placeholder {
      color: #d6d6e1;
    }
    :focus {
      border: 1px solid #aaa;
    }
  }
`;

const Title = styled.div`
  color: rgb(38, 42, 62);
  font-weight: 700;
  font-size: 24px;
  margin-bottom: 40px;
  display: flex;
  align-items: center;
`;

const Button = styled.button`
  background-color: #3182ce;
  outline: 0;
  border: 0;
  color: #fff;
  border-radius: 4px;
  padding: 10px 20px;
  font-size: 14px;
  cursor: pointer;
  :hover {
    background-color: #5a9bd8;
  }
`;

const LogoUpload = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 30px;
  img {
    height: 70px;
    width: 70px;
    min-height: 70px;
    min-width: 70px;
    border-radius: 50%;
    object-fit: cover;
  }
  .UploadButton {
    background-color: #fff;
    border: 1px solid #dcdfe6;
    outline: 0;
    align-self: flex-start;
    border-radius: 4px;
    padding: 8px 20px;
    font-size: 14px;
    text-transform: capitalize;
    color: #646b7d;
    font-weight: 400;
    cursor: pointer;
    display: inline-block !important;
    :hover {
      color: rgb(49, 130, 206);
      border-color: rgb(193, 218, 240);
      background-color: rgb(234, 243, 250);
    }
  }
`;
