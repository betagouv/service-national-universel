import { Field, Formik } from "formik";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory, Redirect } from "react-router-dom";
import validator from "validator";

import { toast } from "react-hot-toast";

import { setOrganisation, setUser } from "../../redux/auth/actions";

import API from "../../services/api";

export default () => {
  const user = useSelector((state) => state.Auth.user);
  const dispatch = useDispatch();
  const history = useHistory();

  if (user) return <Redirect to={"/"} />;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 justify-center">
        <div className=" h-6/12  min-h-[400px] w-6/12 bg-snu-purple-600 bg-[url('./assets/computer.jpeg')] bg-cover bg-center bg-no-repeat " />
        <div className="flex flex-1 flex-col justify-center bg-gray-50 p-8">
          <h4 className="mb-6 w-full text-center text-xl font-bold text-black">Connexion</h4>
          <Formik
            initialValues={{ email: "", password: "" }}
            onSubmit={async (values, actions) => {
              try {
                const response = await API.post({ path: "/agent/signin", body: values });
                if (!response.ok) {
                  console.log(response);
                  toast.error(response.code);
                  actions.setSubmitting(false);
                  return;
                }
                const { user, organisation, token } = response;
                if (token) API.setToken(token);
                if (organisation) dispatch(setOrganisation(organisation));
                if (user) dispatch(setUser(user));

                actions.setSubmitting(false);
                history.push("/");
              } catch (e) {
                console.log("e", e);
                toast.error(e.code);
              }
            }}
          >
            {({ values, isSubmitting, handleChange, handleSubmit }) => {
              return (
                <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="input-label">Email</label>
                      <Field
                        validate={(v) => !validator.isEmail(v) && "Invalid email address"}
                        name="email"
                        type="email"
                        id="email"
                        autoComplete="email"
                        value={values.email}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Entrez votre email"
                      />
                    </div>
                    <div>
                      <label className="input-label">Mot de passe</label>
                      <Field
                        validate={(v) => validator.isEmpty(v) && "This field is Required"}
                        name="password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={values.password}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Entrez votre mot de passe"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          id="remember"
                          type="checkbox"
                          className="text-royalblue-600 focus:border-royalblue-300 focus:ring-royalblue-200 rounded border-gray-300 shadow-sm focus:ring focus:ring-opacity-50 focus:ring-offset-0"
                        />
                        <label htmlFor="remember" className="select-none text-sm font-medium text-gray-600 hover:text-snu-purple-800">
                          Se souvenir de moi
                        </label>
                      </div>

                      <Link to="auth/forgot" className="text-sm font-medium text-gray-600 transition-colors hover:text-snu-purple-800">
                        Mot de passe oublié ?
                      </Link>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="auth-button-primary">
                      Se connecter
                    </button>
                    {/* <p className="text-sm text-center text-gray-400">
                      Not registered?{" "}
                      <Link to="/auth/signup" className="font-medium transition-all text-royalblue-500 hover:text-royalblue-600">
                        Create account
                      </Link>
                    </p> */}
                  </div>
                </form>
              );
            }}
          </Formik>
        </div>
      </div>
    </div>
  );
};
