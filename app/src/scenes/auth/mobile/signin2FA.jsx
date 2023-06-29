import queryString from "query-string";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import RightArrow from "../../../assets/icons/RightArrow";
import Input from "../../../components/inscription/input";
import { setYoung } from "../../../redux/auth/actions";
import api from "../../../services/api";
import Error from "../../../components/error";
import Footer from "../../../components/footerV2";
import { BsShieldLock } from "react-icons/bs";

export default function Signin() {
  const [disabled, setDisabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState({});
  const history = useHistory();
  const [token2FA, setToken2FA] = React.useState("");

  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);

  const params = queryString.parse(location.search);
  const { redirect, disconnected, email } = params;

  React.useEffect(() => {
    if (!young && disconnected === "1") toastr.error("Votre session a expiré", "Merci de vous reconnecter.", { timeOut: 10000 });
    if (young) history.push("/" + (redirect || ""));
  }, [young]);

  const onSubmit = async ({ email, token }) => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      setLoading(true);
      const response = await api.post(`/young/signin-2fa`, { email, token_2fa: token.trim() });
      setLoading(false);
      if (response.token) api.setToken(response.token);
      if (response.user) {
        if (redirect?.startsWith("http")) return (window.location.href = redirect);
        dispatch(setYoung(response.user));
      }
    } catch (e) {
      setLoading(false);
      toastr.error("(Double authentification) Code non reconnu.", "Merci d'inscrire le dernier code reçu par email");
    }
  };

  React.useEffect(() => {
    if (token2FA) setDisabled(false);
    else setDisabled(true);
  }, [token2FA]);

  return (
    <>
      <div className="bg-white px-4 pt-4 pb-12">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        <div className="text-[22px] font-bold text-[#161616]">Me connecter</div>
        <div className="flex items-center gap-4 py-4">
          <div className="flex items-center text-[#161616] text-[21px] gap-2">
            <BsShieldLock className="text-4xl text-[#161616] text-[21px]" /> Authentification à deux facteurs
          </div>
        </div>
        <div className="flex flex-col gap-1 py-4">
          <label className="text-[14px] text-[#3A3A3A] mb-4">
            Un mail contenant le code unique de connexion vous a été envoyé à l'adresse <b>{email}</b>. Ce code est valable pendant 10 minutes, si vous avez reçu plusieurs codes
            veuillez svp utiliser le dernier qui vous a été transmis par mail.
          </label>
          <label className="text-[14px] text-[#3A3A3A] mb-2">Saisir le code reçu par email</label>
          <Input placeholder="123abc" value={token2FA} onChange={(e) => setToken2FA(e)} />
        </div>
        <button className="flex w-full cursor-pointer items-center justify-center p-2 bg-[#000091] text-white" onClick={() => onSubmit({ email, token: token2FA })}>
          Connexion
        </button>
        <hr className="mt-4"></hr>
        <div className="mt-4">
          <label className="text-gray-500 text-[12px] mb-2">Si vous ne recevez pas le mail, nous vous invitons à vérifier que :</label>
          <ul className="text-[#0063CB] text-xs mb-2 list-disc">
            <li className="ml-3 mb-1">L'adresse mail que vous utilisez est bien celle indiquée ci-dessus</li>
            <li className="ml-3 mb-1">Le mail ne se trouve pas dans vos spam</li>
            <li className="ml-3 mb-1">l'adresse mail no_reply-mailauto@snu.gouv.fr ne fait pas partie des adresses indésirables de votre boite mail</li>
            <li className="ml-3 mb-1">votre boite de réception n'est pas saturée</li>
          </ul>
        </div>
      </div>
      <Footer />
    </>
  );
}
