import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Redirect, useHistory } from "react-router-dom";
import { formatToActualTime } from "snu-lib/date";
import Eye from "../../../assets/icons/Eye";
import EyeOff from "../../../assets/icons/EyeOff";
import RightArrow from "../../../assets/icons/RightArrow";
import Input from "../../../components/inscription/input";
import { setYoung } from "../../../redux/auth/actions";
import api from "../../../services/api";
import Error from "../components/error";
import queryString from "query-string";

export default function Signin() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [disabled, setDisabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState({});
  const history = useHistory();

  const dispatch = useDispatch();
  const young = useSelector((state) => state.Auth.young);

  const params = queryString.parse(location.search);
  const { redirect, disconnected } = params;

  if (disconnected === "1") toastr.error("Votre session a expiré", "Merci de vous reconnecter.", { timeOut: 10000 });

  React.useEffect(() => {
    if (young) history.push("/" + (redirect || ""));
  }, [young]);

  const onSubmit = async () => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      const { user: young, token } = await api.post(`/young/signin`, { email, password });
      if (young) {
        if (redirect?.startsWith("http")) return (window.location.href = redirect);
        if (token) api.setToken(token);
        dispatch(setYoung(young));
      }
    } catch (e) {
      setPassword("");
      setError({ text: "  E-mail et/ou mot de passe incorrect(s)" });
      if (e.code === "TOO_MANY_REQUESTS") {
        let date = formatToActualTime(e?.data?.nextLoginAttemptIn);
        setError({ text: " Vous avez atteint le maximum de tentatives de connexion autorisées.", subText: `Réessayez ${date !== "-" ? `à ${date}.` : "demain."}` });
      }
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (email && password) setDisabled(false);
    else setDisabled(true);
  }, [email, password]);
  return (
    <div className="bg-[#F9F6F2] h-[80vh] py-8 flex">
      <div className="bg-white basis-[50%] mx-auto my-0 px-[102px] py-[60px]">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        <div className="text-[#161616] text-[32px] font-bold mb-1">Me connecter</div>
        <div className="flex items-center mb-2 gap-4">
          <RightArrow />
          <div className="text-[#161616] text-[21px] font-bold">Mon espace volontaire</div>
        </div>
        <div className="flex flex-col gap-1 py-1 mb-1">
          <label className="text-[#161616] text-base">E-mail</label>
          <Input value={email} onChange={(e) => setEmail(e)} />
        </div>
        <div className="flex flex-col gap-1 pb-4">
          <label className="text-[#161616] text-base">Mot de passe</label>
          <div className="flex items-center w-full bg-[#EEEEEE] px-4 py-2 border-b-[2px] border-[#3A3A3A] rounded-t-[4px]">
            <input className="w-full bg-inherit" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
            {showPassword ? <EyeOff className="cursor-pointer" onClick={() => setShowPassword(false)} /> : <Eye className="cursor-pointer" onClick={() => setShowPassword(true)} />}
          </div>
        </div>
        <div className="pb-4 text-[#000091] underline text-base font-normal" onClick={() => history.push("/auth/forgot")}>
          Mot de passe perdu ?
        </div>
        <div className="w-full flex justify-end">
          <button
            className={`flex items-center justify-center p-2 cursor-pointer ${disabled || loading ? "bg-[#E5E5E5] text-[#929292]" : "bg-[#000091] text-white"}`}
            onClick={onSubmit}>
            Connexion
          </button>
        </div>

        <hr className="text-[#E5E5E5] mt-4" />
        <div className="text-[#161616] text-[17px] font-bold text-center mt-3 mb-2">Vous n&apos;êtes pas encore inscrit(e) ?</div>
        <div className="flex justify-center">
          <button className="flex items-center justify-center p-2 cursor-pointer border-[1px] border-[#000091] text-[#000091]" onClick={() => history.push("/preinscription")}>
            Commencer mon inscription
          </button>
        </div>
      </div>
    </div>
  );
}
