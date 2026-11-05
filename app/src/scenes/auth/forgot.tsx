import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import RightArrow from "../../assets/icons/RightArrow";
import Input from "../../components/dsfr/forms/input";
import api from "../../services/api";
import Error from "../../components/error";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import { Button } from "@snu/ds/dsfr";
import { ERRORS } from "snu-lib";

interface ErrorState {
  text?: string;
  subText?: string;
}

/**
 * La route répond 200 que le compte existe ou non : une erreur ne dit donc jamais « aucun compte ».
 * L'ancien message « Aucun e-mail correspondant » s'affichait pour tout refus, quota compris.
 */
function forgotErrorMessage(code?: string): ErrorState {
  if (code === ERRORS.TOO_MANY_REQUESTS) return { text: "Trop de demandes de lien depuis votre connexion.", subText: "Patientez quelques minutes avant de réessayer." };
  if (code === ERRORS.EMAIL_OR_PASSWORD_INVALID)
    return { text: "Cette adresse e-mail n'est pas valide.", subText: "Vérifiez qu'elle est complète, par exemple prenom.nom@exemple.fr." };
  return { text: "Une erreur s'est produite.", subText: "Réessayez dans quelques minutes." };
}

const Forgot: React.FC = () => {
  const [done, setDone] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ErrorState>({});

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    try {
      setLoading(true);
      await api.post("/young/forgot_password", { email });
      setDone(true);
      setError({});
    } catch (e) {
      setError(forgotErrorMessage(e?.code));
      setLoading(false);
    }
  };

  return (
    <DSFRContainer title="Réinitialiser mon mot de passe">
      {error && Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
      <p className="flex items-center gap-4 font-bold text-xl">
        <RightArrow className="inline-block" />
        Mon espace volontaire
      </p>
      {!done ? (
        <form onSubmit={onSubmit}>
          <div className="flex flex-col gap-1 py-3">
            <label className="text-base text-[#161616]">E-mail</label>
            <Input value={email} onChange={setEmail} />
          </div>
          <Button
            disabled={!email}
            className="flex cursor-pointer items-center justify-center bg-[#000091] px-3 py-2 text-white hover:border hover:border-[#000091] hover:bg-white hover:!text-[#000091]  disabled:cursor-default disabled:border-0 disabled:bg-[#E5E5E5] disabled:!text-[#929292]"
            type="submit">
            M&apos;envoyer le lien de réinitialisation
          </Button>
        </form>
      ) : (
        <div className="text-base text-[#161616] ">
          <span className="font-medium"> Un email de réinitialisation de mot de passe a été envoyé à </span> "<b>{email}</b>" <br /> <br /> Cet email contient un lien permettant de
          réinitialiser votre mot de passe. <br /> <br /> Vous allez le recevoir d’ici quelques minutes, pensez à vérifier vos spams et courriers indésirables. <br /> <br /> Si
          vous ne recevez aucun email, cela veut dire que vous n&apos;avez pas encore de compte. <br /> <br /> Le lien est valable 2 heures. Si vous faites plusieurs demandes, seul
          le lien du dernier e-mail reçu fonctionne.
        </div>
      )}
      <hr className="mt-6 text-[#E5E5E5]" />
      <Link to="/auth">Retourner à la connexion</Link>
    </DSFRContainer>
  );
};

export default Forgot;
