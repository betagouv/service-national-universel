import React, { useState } from "react";
import { Formik } from "formik";
import { toastr } from "react-redux-toastr";
import { Redirect, Link } from "react-router-dom";
import PasswordEye from "../../components/PasswordEye";
import queryString from "query-string";
import api from "../../services/api";
import Header from "./components/header";
import { translate } from "../../utils";
import LoginBox from "./components/LoginBox";

export default function Reset() {
  const [redirect, setRedirect] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {redirect && <Redirect to="/auth" />}
      <Header />
      <LoginBox>
        {/* Title */}
        <div className="relative text-center text-[0.8rem] md:text-[1rem] font-bold	mb-[1.25rem] after:content-[''] after:block after:h-[1px] after:w-full after:bg-[#d2d6dc] after:absolute after:left-0 after:top-1/2 after:z-[-1] after:translate-y-[-50%]">
          <span className="bg-[#fff] text-[#161E2E] p-2">Mon espace volontaire</span>
        </div>
        {/* SubTitle */}
        <span className="text-center text-[1.2rem] mb-[20px] font-medium">Réinitialiser mon mot de passe</span>
        <Formik
          initialValues={{ password: "" }}
          validateOnChange={false}
          validateOnBlur={false}
          onSubmit={async ({ password }, actions) => {
            try {
              const { token } = queryString.parse(window.location.search);
              const res = await api.post("/young/forgot_password_reset", { password, token });
              if (!res.ok) throw res;
              toastr.success("Mot de passe changé avec succès");
              setRedirect(true);
            } catch (e) {
              return toastr.error("Une erreur s'est produite :", translate(e && e.code));
            }
            actions.setSubmitting(false);
          }}>
          {({ values, errors, isSubmitting, handleChange, handleSubmit }) => {
            return (
              <form onSubmit={handleSubmit}>
                {redirect && <Redirect to="/" />}
                <section className="mb-[20px]">
                  <label className="text-[#37415b] text-sm	mb-[5px]">Mot de passe</label>
                  <PasswordEye value={values.password} onChange={handleChange} />
                  <p className="text-xs mt-1 text-[#FD3131]">{errors.password}</p>
                  <p>👉 Il doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole</p>
                </section>
                <div className="button">
                  <button
                    loading={isSubmitting}
                    type="submit"
                    color="primary"
                    disabled={isSubmitting}
                    className="w-full block text-[18px] text-lg text-white font-bold p-[12px] bg-[#5145cd] mt-[30px] mb-[30px] cursor-pointer shadow-xl rounded-[10px] hover:bg-[#42389d]">
                    Confirmer
                  </button>
                </div>
              </form>
            );
          }}
        </Formik>
        {/* Title */}
        <div className="relative text-center text-[0.8rem] md:text-[1rem] font-bold	mb-[1.25rem] after:content-[''] after:block after:h-[1px] after:w-full after:bg-[#d2d6dc] after:absolute after:left-0 after:top-1/2 after:z-[-1] after:translate-y-[-50%]">
          <span className="bg-[#fff] text-[#161E2E] p-2">Retourner à la connexion</span>
        </div>

        {/* Register */}
        <Link
          className="w-full block text-[#000] text-center text-[18px] font-bold p-[12px] bg-[#fff] mt-[20px] rounded-[10px] border-[1px] border-[#e5e7eb] hover:text-[#000] hover:bg-[#f4f5f7]"
          to="/auth/signin">
          Se connecter
        </Link>
      </LoginBox>
    </div>
  );
}
