import React from "react";
import { Button, FormGroup } from "reactstrap";
import { Formik, Field } from "formik";
import classnames from "classnames";
import validator from "validator";
import { Link, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import styled from "styled-components";

import { setYoung } from "../../redux/auth/actions";

import api from "../../services/api";
import LoadingButton from "../../components/loadingButton";

export default () => {
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);

  return (
    <AuthWrapper>
      <Title>Signup</Title>
      {young && <Redirect to="/" />}
      <Formik
        initialValues={{ name: "", email: "", password: "", repassword: "" }}
        onSubmit={async (values, actions) => {
          try {
            const { young, token, code, ok } = await api.post(`/young/signup`, values);
            actions.setSubmitting(false);
            if (!ok) return toastr.error("Wrong signup", code);
            if (token) api.setToken(token);
            if (young) dispatch(setYoung(young));
          } catch (e) {
            actions.setSubmitting(false);
            console.log("e", e);
          }
        }}
      >
        {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
          return (
            <form onSubmit={handleSubmit}>
              <StyledFormGroup>
                <div>
                  <InputField validate={(v) => validator.isEmpty(v) && "This field is Required"} name="name" type="name" id="name" value={values.name} onChange={handleChange} />
                  <label htmlFor="name">Full name</label>
                </div>
                <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.name}</p>
              </StyledFormGroup>
              <StyledFormGroup>
                <div>
                  <InputField
                    validate={(v) => !validator.isEmail(v) && "Invalid email address"}
                    name="email"
                    type="email"
                    id="email"
                    value={values.email}
                    onChange={handleChange}
                  />
                  <label htmlFor="email">E-mail address</label>
                </div>
                <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.email}</p>
              </StyledFormGroup>
              <StyledFormGroup>
                <div>
                  <InputField
                    validate={(v) => validator.isEmpty(v) && "This field is Required"}
                    name="password"
                    type="password"
                    id="password"
                    value={values.password}
                    onChange={handleChange}
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.password}</p>
              </StyledFormGroup>
              <StyledFormGroup>
                <div>
                  <InputField
                    validate={(v) => values.password !== values.repassword && "Should be same as password"}
                    name="repassword"
                    type="password"
                    id="repassword"
                    value={values.repassword}
                    onChange={handleChange}
                  />
                  <label htmlFor="repassword">Re-type Password</label>
                </div>
                <p style={{ fontSize: 12, color: "rgb(253, 49, 49)" }}>{errors.repassword}</p>
              </StyledFormGroup>
              <Submit loading={isSubmitting} type="submit" color="primary">
                Signup
              </Submit>
              <Account>
                If you already have account you can <Link to="/auth/signin">Signin</Link>.
              </Account>
            </form>
          );
        }}
      </Formik>
    </AuthWrapper>
  );
};

const AuthWrapper = styled.div`
  max-width: 500px;
  width: calc(100% - 40px);
  padding: 40px 30px 30px;
  border-radius: 0.5em;
  background-color: #fff;
  font-family: Nista, Helvetica;
  color: #252b2f;
  margin: 5em auto;
  overflow: hidden;
  -webkit-box-shadow: 0 0 1.25rem 0 rgba(0, 0, 0, 0.2);
  box-shadow: 0 0 1.25rem 0 rgba(0, 0, 0, 0.2);
`;

const Title = styled.div`
  font-family: Helvetica;
  text-align: center;
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 15px;
`;

const Submit = styled(LoadingButton)`
  font-family: Helvetica;
  width: 220px;
  border-radius: 30px;
  margin: auto;
  display: block;
  font-size: 16px;
  padding: 8px;
  min-height: 42px;
`;

const InputField = styled(Field)`
  background-color: transparent;
  outline: 0;
  display: block;
  width: 100%;
  padding: 0.625rem;
  margin-bottom: 0.375rem;
  border-radius: 4px;
  border: 1px solid #a7b0b7;
  color: #252b2f;
  -webkit-transition: border 0.2s ease;
  transition: border 0.2s ease;
  line-height: 1.2;
  &:focus {
    outline: none;
    border: 1px solid #116eee;
    & + label {
      color: #116eee;
    }
  }
`;
const Account = styled.div`
  text-align: center;
  padding-top: 25px;
  font-size: 14px;
`;

const StyledFormGroup = styled(FormGroup)`
  margin-bottom: 15px;
  div {
    display: flex;
    flex-direction: column-reverse;
  }
`;
