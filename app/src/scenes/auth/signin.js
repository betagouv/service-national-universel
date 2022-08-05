import React, { useState } from "react";
import { Formik } from "formik";
import { Link, Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import queryString from "query-string";

import { setYoung } from "../../redux/auth/actions";
import LoginBox from "./components/LoginBox";
import api from "../../services/api";
import Header from "./components/header";
import ModalInProgress from "../../components/modals/ModalInProgress";
import { toastr } from "react-redux-toastr";
import PasswordEye from "../../components/PasswordEye";
import EduConnectButton from "../../components/buttons/EduConnectButton";
import { educonnectAllowed } from "../../config";
import { formatToActualTime } from "snu-lib/date";

/*
About Redirect after signin
we use this signin screen in the `app`, but also outside the app in `knowledge-base` which is not in the same origin
-> signin and redirect within the app would be an url like http://localhost:8081/auth?redirect=/my-page
|-> redirection is made with `if (young) return <Redirect to={"/" + (redirect || "")} />;`
-> signin and redirect outside the app would be an url like http://localhost:8081/auth?redirect=http(s)://localhost:8083/
|-> redirection is made with `if (redirect.startsWith('http')) return window.location.href = redirect;`
*/

export default function Signin() {
  const [modal, setModal] = useState(null);
  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);
  const [userIsValid, setUserIsValid] = useState(true);
  const [tooManyRequests, setTooManyRequests] = useState({ status: false, date: null });
  const params = queryString.parse(location.search);
  const { redirect, disconnected } = params;

  if (young) return <Redirect to={"/" + (redirect || "")} />;
  if (disconnected === "1") toastr.error("Votre session a expiré", "Merci de vous reconnecter.", { timeOut: 10000 });

  return (
    <div className="flex flex-col min-h-screen">
      {modal === "inProgress" && (
        <ModalInProgress
          onChange={() => setModal(false)}
          cb={() => {
            setModal(false);
          }}
        />
      )}
      <Header />

      {/* Login Box */}
      <LoginBox>
        {educonnectAllowed && (
          <div className="mb-4 flex justify-center">
            <EduConnectButton />
          </div>
        )}
        <div className="relative text-center text-[0.8rem] md:text-[1rem] font-bold	mb-[1.25rem] after:content-[''] after:block after:h-[1px] after:w-full after:bg-[#d2d6dc] after:absolute after:left-0 after:top-1/2 after:z-[-1] after:translate-y-[-50%]">
          <span className="bg-[#fff] text-[#161E2E] p-2">Mon espace volontaire</span>
        </div>
        <Formik
          initialValues={{ email: "", password: "" }}
          onSubmit={async ({ email, password }, actions) => {
            try {
              const { user: young, token } = await api.post(`/young/signin`, { email, password });
              if (young) {
                if (redirect?.startsWith("http")) return (window.location.href = redirect);
                if (token) api.setToken(token);
                dispatch(setYoung(young));
              }
            } catch (e) {
              actions.setFieldValue("password", "");
              console.log("e", e);
              setUserIsValid(false);
              if (e.code === "TOO_MANY_REQUESTS") {
                setTooManyRequests({ status: true, date: formatToActualTime(e?.data?.nextLoginAttemptIn) });
              }
            }
            actions.setSubmitting(false);
          }}>
          {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
            return (
              <form onSubmit={handleSubmit}>
                {!userIsValid && (
                  <div className="mb-[20px]">
                    <div className="w-full block p-[15px] mt-[3px] text-[#c73738] bg-[#fff5f5] rounded-[5px] leading-tight border-[1px] border-[#fc8180]">
                      E-mail et/ou mot de passe incorrect(s)
                    </div>
                  </div>
                )}
                {tooManyRequests?.status && (
                  <div className="mb-[20px]">
                    <div className="w-full block p-[15px] mt-[3px] text-[#c73738] bg-[#fff5f5] rounded-[5px] leading-tight border-[1px] border-[#fc8180]">
                      Vous avez atteint le maximum de tentatives de connexion autorisées. Réessayez {tooManyRequests.date !== "-" ? `à ${tooManyRequests.date}.` : "demain."}
                    </div>
                  </div>
                )}

                <section className="mb-[20px]">
                  <div className="flex flex-col-reverse	">
                    <input
                      className="w-full block outline-0	 p-[12px]  bg-[transparent] placeholder:text-[#798fb0] leading-5  rounded-[5px] border-[1px] border-[#dcdfe6] focus:border-[#4299E1] focus:outline-0 "
                      // validate={(v) => !validator.isEmail(v) && "Invalid email address"}
                      name="email"
                      type="email"
                      id="email"
                      placeholder="Adresse e-mail"
                      value={values.email}
                      onChange={handleChange}
                    />
                    <label className="text-[#37415b] text-sm	mb-[5px] focus:text-[#434190]" htmlFor="email">
                      E-mail
                    </label>
                  </div>
                  <p className="text-xs mt-1 text-[#FD3131]">{errors.email}</p>
                </section>
                <section className="mb-[20px]">
                  <div className="flex flex-col-reverse	">
                    <PasswordEye autoComplete="current-password" value={values.password} onChange={handleChange} showError={false} />
                    <label className="text-[#37415b] text-sm	mb-[5px] focus:text-[#434190]" htmlFor="password">
                      Mot de passe
                    </label>
                  </div>
                  <p className="text-xs mt-1 text-[#FD3131]">{errors.password}</p>
                </section>
                {/* Forget Password */}
                <div className="mb-[20px]">
                  <Link className="text-[#5145cd] text-[14px]" to="/auth/forgot">
                    Mot de passe perdu ?
                  </Link>
                </div>
                {/* Forget Password */}
                {/* Submit Button */}
                <button
                  className="w-full block text-[18px] text-lg text-white font-bold p-[12px] bg-[#5145cd] mt-[30px] mb-[30px] cursor-pointer shadow-xl rounded-[10px] hover:bg-[#42389d]"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                  type="submit">
                  Connexion
                </button>
                {/* Submit Button */}
              </form>
            );
          }}
        </Formik>
        <div className="relative text-center text-[0.8rem] md:text-[1rem] font-bold	mb-[1.25rem] after:content-[''] after:block after:h-[1px] after:w-full after:bg-[#d2d6dc] after:absolute after:left-0 after:top-1/2 after:z-[-1] after:translate-y-[-50%]">
          <span className="bg-[#fff] text-[#161E2E] p-2">Vous n&apos;êtes pas encore inscrit ?</span>
        </div>
        {/* Register Button */}
        <Link
          className="w-full block text-[#000] text-center text-[18px] font-bold p-[12px] bg-[#fff] mt-[20px] rounded-[10px] border-[1px] border-[#e5e7eb] hover:text-[#000] hover:bg-[#f4f5f7]"
          to="/inscription/profil">
          Commencer l&apos;inscription
        </Link>
        {/* Register Button */}
      </LoginBox>
    </div>
  );
}
