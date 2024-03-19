import React from "react";
import { useHistory } from "react-router-dom";
import RightArrow from "../../../assets/icons/RightArrow";
import Input from "../../../components/dsfr/forms/input";
import api from "../../../services/api";
import Error from "../../../components/error";
import { Button } from "@snu/ds/dsfr";

export default function Forgot() {
  const [done, setDone] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [disabled, setDisabled] = React.useState(true);
  const [error, setError] = React.useState({});
  const history = useHistory();

  React.useEffect(() => {
    if (email) setDisabled(false);
    else setDisabled(true);
  }, [email]);

  const onSubmit = async () => {
    if (loading || disabled) return;
    try {
      setLoading(true);
      await api.post("/young/forgot_password", { email });
      setDone(true);
      setError({});
    } catch (e) {
      setError({ text: "Aucun e-mail correspondant" });
      setLoading(false);
    }
  };
  return (
    <div className="flex bg-[#F9F6F2] py-8">
      <div className="mx-auto my-0 basis-[50%] bg-white px-[102px] py-[60px]">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        <div className="text-[22px] font-bold text-[#161616]">Réinitialiser mon mot de passe</div>
        <div className="flex items-center gap-4 py-4">
          <RightArrow />
          <div className="text-[17px] font-bold text-[#161616]">Mon espace volontaire</div>
        </div>
        {!done ? (
          <>
            <Input label="E-mail" value={email} onChange={(e) => setEmail(e)} />
            <div className="flex justify-end">
              <Button disabled={disabled || loading} onClick={onSubmit}>
                M&apos;envoyer le lien de réinitialisation
              </Button>
            </div>
          </>
        ) : (
          <div className="text-base text-[#161616] ">
            <span className="font-medium"> Un email de réinitialisation de mot de passe a été envoyé à </span> {email} <br /> <br /> Cet email contient un lien permettant de
            réinitialiser votre mot de passe. <br /> <br /> Vous allez le recevoir d’ici quelques minutes, pensez à vérifier vos spams et courriers indésirables.
            <br /> <br /> Si vous ne recevez aucun email, cela veut dire que vous n&apos;avez pas encore de compte.
          </div>
        )}
        <hr className="mt-4 text-[#E5E5E5]" />
        <div className="mt-2 py-4 text-center text-[17px] font-bold text-[#161616]">Retourner à la connexion</div>
        <div className="flex justify-center">
          <Button
            className="flex cursor-pointer items-center justify-center border-[1px] border-[#000091] p-2 text-[#000091] hover:bg-[#000091] hover:text-white"
            onClick={() => history.push("/auth")}>
            Se connecter
          </Button>
        </div>
      </div>
    </div>
  );
}
