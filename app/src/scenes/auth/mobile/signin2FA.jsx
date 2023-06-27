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
      const response = await api.post(`/young/signin-2fa`, { email, token_2fa: token });
      setLoading(false);
      if (response.token) api.setToken(response.token);
      if (response.user) {
        if (redirect?.startsWith("http")) return (window.location.href = redirect);
        dispatch(setYoung(response.user));
      }
    } catch (e) {
      setLoading(false);
      toastr.error("Erreur détectée");
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
          <RightArrow />
          <div className="flex items-center gap-2 text-blue-500 uppercase">
            <BsShieldLock className="text-blue-500 text-4xl" /> Authentification à deux facteurs
          </div>
        </div>
        <div className="flex flex-col gap-1 py-4">
          <label className="text-base text-[#161616]">
            Merci d'entrer le code transmis par e-mail à l'adresse <b>{email}</b> :
          </label>
          <Input placeholder="123abc" value={token2FA} onChange={(e) => setToken2FA(e)} />
        </div>
        <button
          className={`flex w-full cursor-pointer items-center justify-center p-2 ${disabled || loading ? "bg-[#E5E5E5] text-[#929292]" : "bg-[#000091] text-white"}`}
          onClick={() => onSubmit({ email, token: token2FA })}>
          Valider
        </button>
      </div>
      <Footer />
    </>
  );
}
