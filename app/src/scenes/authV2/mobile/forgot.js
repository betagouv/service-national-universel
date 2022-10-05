import React from "react";
import { useHistory } from "react-router-dom";
import RightArrow from "../../../assets/icons/RightArrow";
import Input from "../../../components/inscription/input";
import api from "../../../services/api";
import Error from "../components/error";

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
    <>
      <div className="bg-white px-4 pt-4 pb-12">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        <div className="text-[#161616] text-[22px] font-bold">Réinitialiser mon mot de passe</div>
        <div className="flex items-center py-4 gap-4">
          <RightArrow />
          <div className="text-[#161616] text-[17px] font-bold">Mon espace volontaire</div>
        </div>
        {!done ? (
          <>
            <div className="flex flex-col gap-1 py-3">
              <label className="text-[#161616] text-base">E-mail</label>
              <Input value={email} onChange={(e) => setEmail(e)} />
            </div>
            <button
              className={`mt-4 flex items-center justify-center p-2 w-full cursor-pointer ${disabled || loading ? "bg-[#E5E5E5] text-[#929292]" : "bg-[#000091] text-white"}`}
              onClick={onSubmit}>
              M&apos;envoyer le lien de réinitialisation
            </button>
          </>
        ) : (
          <div className="text-[#161616] text-base ">
            <span className="font-medium"> Un email de réinitialisation de mot de passe a été envoyé à </span> {email} <br /> <br /> Cet email contient un lien permettant de
            réinitialiser votre mot de passe. <br /> <br /> Vous allez le recevoir d’ici quelques minutes, pensez à vérifier vos spams et courriers indésirables.
          </div>
        )}
        <hr className="text-[#E5E5E5] mt-6" />
        <div className="text-[#161616] text-[17px] font-bold py-4 text-center mt-4">Retourner à la connexion</div>
        <button className="flex items-center justify-center p-2 w-full cursor-pointer border-[1px] border-[#000091] text-[#000091]" onClick={() => history.push("/auth")}>
          Se connecter
        </button>
      </div>
    </>
  );
}
