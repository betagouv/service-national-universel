import React, { useState } from "react";
import { Formik } from "formik";
import classnames from "classnames";
import validator from "validator";
import { toastr } from "react-redux-toastr";
import { Link } from "react-router-dom";
import api from "../../services/api";
import Header from "./components/header";
import { translate } from "../../utils";
import LoginBox from "./components/LoginBox";

export default function Forgot() {
  const [done, setDone] = useState(false);
  const [mail, setMail] = useState();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <LoginBox>
        {/* Title */}
        <div className="relative text-center text-[0.8rem] md:text-[1rem] font-bold	mb-[1.25rem] after:content-[''] after:block after:h-[1px] after:w-full after:bg-[#d2d6dc] after:absolute after:left-0 after:top-1/2 after:z-[-1] after:translate-y-[-50%]">
          <span className="bg-[#fff] text-[#161E2E] p-2">Mon espace volontaire</span>
        </div>

        {done ? (
          <>
            {/* SubTitle */}
            <span className="text-center text-[1.2rem] mb-[20px] font-medium">Un email de réinitialisation de mot de passe vous a été envoyé !</span>
            <span className="text-center text-[1.2rem] mb-[20px] font-medium">
              <span>{mail}</span>
            </span>
            {/* SubTitle */}
            <p className="text-[1rem] text-center font-normal	italic leading-none mb-[20px]">
              Cet email contient un lien permettant de réinitialiser votre mot de passe.
              <br />
              Vous allez le recevoir d&apos;ici quelques minutes, pensez à vérifier vos spams et courriers indésirables.
            </p>
          </>
        ) : (
          <>
            <p className="text-center text-[1.2rem] mb-[20px] font-medium">Réinitialiser mon mot de passe</p>

            <Formik
              initialValues={{ email: "" }}
              onSubmit={async ({ email }, actions) => {
                try {
                  await api.post("/young/forgot_password", { email });
                  toastr.success("E-mail envoyé !");
                  setMail(email);
                  setDone(true);
                } catch (e) {
                  toastr.error("Erreur !", translate(e.code));
                }
                actions.setSubmitting(false);
              }}>
              {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
                return (
                  <form onSubmit={handleSubmit}>
                    <section className="mb-[20px]">
                      <div className="flex flex-col-reverse	">
                        <input
                          validate={(v) => !validator.isEmail(v) && "format incorrect"}
                          className={`${classnames({
                            "has-error": errors.email,
                          })}w-full block outline-0 p-[12px] bg-[transparent] text-[#798fb0] leading-5  rounded-[5px] border-[1px] border-[#e2e8f0] focus:border-[#4299E1] focus:outline-0 `}
                          name="email"
                          type="email"
                          id="email"
                          value={values.email}
                          onChange={handleChange}
                          placeholder="Adresse e-mail"
                        />
                        <label className="text-[#37415b] text-sm	mb-[5px] focus:text-[#434190]" htmlFor="email">
                          E-mail
                        </label>
                      </div>
                      <p className="text-xs mt-1 text-[#FD3131]">{errors.email}</p>
                    </section>
                    <button
                      className="w-full block text-[18px] font-bold p-[12px] bg-[#5145cd] mt-[30px] mb-[30px] cursor-pointer shadow-xl	 rounded-[10px] hover:bg-[#42389d]"
                      type="submit"
                      color="success"
                      loading={isSubmitting}>
                      M&apos;envoyer le lien de réinitialisation
                    </button>
                  </form>
                );
              }}
            </Formik>
          </>
        )}
        {/* Title */}
        <div className="relative text-center text-[0.8rem] md:text-[1rem] font-bold	mb-[1.25rem] after:content-[''] after:block after:h-[1px] after:w-full after:bg-[#d2d6dc] after:absolute after:left-0 after:top-1/2 after:z-[-1] after:translate-y-[-50%]">
          <span className="bg-[#fff] text-[#161E2E] p-2">Retourner à la connexion</span>
        </div>

        <Link
          className="w-full block text-[#000] text-center text-[18px] font-bold p-[12px] bg-[#fff] mt-[20px] rounded-[10px] border-[1px] border-[#e5e7eb] hover:text-[#000] hover:bg-[#f4f5f7]"
          to="/auth/signin">
          Se connecter
        </Link>
      </LoginBox>
    </div>
  );
}
