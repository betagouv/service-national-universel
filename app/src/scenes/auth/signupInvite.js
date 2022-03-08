import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import { Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { setYoung } from "../../redux/auth/actions";
import api from "../../services/api";
import Header from "./components/header";
import LoginBox from "./components/LoginBox";
import { translate } from "../../utils";

export default function SignupInvite() {
  const [invitation, setInvitation] = useState("");
  const [newuser, setNewUser] = useState(null);

  const urlParams = new URLSearchParams(window.location.search);
  const invitationToken = urlParams.get("token");

  useEffect(() => {
    (async () => {
      if (!invitationToken) return setInvitation("INVITATION_TOKEN_EXPIRED_OR_INVALID");
      try {
        const { data: u, token } = await api.post(`/young/signup_verify`, { invitationToken });
        if (token) api.setToken(token);
        setNewUser(u);
      } catch (e) {
        if (e.code === "INVITATION_TOKEN_EXPIRED_OR_INVALID") return setInvitation("INVITATION_TOKEN_EXPIRED_OR_INVALID");
      }
    })();
  }, []);

  const dispatch = useDispatch();

  const young = useSelector((state) => state.Auth.young);

  if (invitation === "INVITATION_TOKEN_EXPIRED_OR_INVALID") return <Redirect to="/auth/invitationexpired" />;
  if (young) return <Redirect to="/" />;

  if (!newuser) return <div>Chargement...</div>;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <LoginBox>
        <div className="relative text-center text-[0.8rem] md:text-[1rem] font-bold	mb-[1.25rem] after:content-[''] after:block after:h-[1px] after:w-full after:bg-[#d2d6dc] after:absolute after:left-0 after:top-1/2 after:z-[-1] after:translate-y-[-50%]">
          <span className="bg-[#fff] text-[#161E2E] p-2">Activer votre espace volontaire</span>
        </div>

        <Formik
          initialValues={{ firstName: newuser.firstName, lastName: newuser.lastName, email: newuser.email, password: "" }}
          onSubmit={async (values, actions) => {
            try {
              const { data: user, token } = await api.post(`/young/signup_invite`, { ...values, invitationToken });
              actions.setSubmitting(false);
              if (token) api.setToken(token);
              if (user) {
                dispatch(setYoung(user));
              }
            } catch (e) {
              actions.setSubmitting(false);
              console.log("e", e);
              if (e.code === "PASSWORD_NOT_VALIDATED")
                return toastr.error(
                  "Mot de passe incorrect",
                  "Votre mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole",
                  { timeOut: 10000 },
                );
              if (e.code === "USER_ALREADY_REGISTERED") return toastr.error("Votre compte est déja activé. Veuillez vous connecter", { timeOut: 10000 });
              return toastr.error("Problème", translate(e.code));
            }
          }}>
          {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
            return (
              <form onSubmit={handleSubmit}>
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
                    <label htmlFor="email">E-mail</label>
                  </div>
                  <p className="text-xs mt-1 text-[#FD3131]">{errors.email}</p>
                </section>
                <section className="mb-[20px]">
                  <div className="flex flex-col-reverse	">
                    <input
                      className="w-full block outline-0	 p-[12px]  bg-[transparent] text-[#798fb0] leading-5  rounded-[5px] border-[1px] border-[#e2e8f0] focus:border-[#4299E1] focus:outline-0 "
                      // validate={(v) => validator.isEmpty(v) && "This field is Required"}
                      name="password"
                      type="password"
                      id="password"
                      placeholder="Votre mot de passe"
                      value={values.password}
                      onChange={handleChange}
                    />
                    <label className="text-[#37415b] text-sm	mb-[5px] focus:text-[#434190]" htmlFor="password">
                      Mot de passe
                    </label>
                  </div>
                  <p className="text-xs mt-1 text-[#FD3131]">{errors.password}</p>
                </section>
                {/* Button Submit */}
                <button
                  className="w-full block text-[18px] text-lg text-white font-bold p-[12px] bg-[#5145cd] mt-[30px] mb-[30px] cursor-pointer shadow-xl	 rounded-[10px] hover:bg-[#42389d]"
                  loading={isSubmitting}
                  type="submit">
                  Connexion
                </button>
              </form>
            );
          }}
        </Formik>
      </LoginBox>
    </div>
  );
}
