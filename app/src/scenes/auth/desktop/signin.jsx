import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { formatToActualTime } from "snu-lib/date";
import Eye from "../../../assets/icons/Eye";
import EyeOff from "../../../assets/icons/EyeOff";
import RightArrow from "../../../assets/icons/RightArrow";
import Input from "../../../components/inscription/input";
import { setYoung } from "../../../redux/auth/actions";
import api from "../../../services/api";
import Error from "../../../components/error";
import queryString from "query-string";
import { useHistory } from "react-router-dom";
import { cohortsInit } from "../../../utils/cohorts";

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

  React.useEffect(() => {
    if (!young && disconnected === "1") toastr.error("Votre session a expiré", "Merci de vous reconnecter.", { timeOut: 10000 });
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
        await cohortsInit();
      }
    } catch (e) {
      setPassword("");
      setError({ text: "  E-mail et/ou mot de passe incorrect(s)" });
      if (e.code === "TOO_MANY_REQUESTS") {
        let date = formatToActualTime(e?.data?.nextLoginAttemptIn);
        setError({
          text: " Vous avez atteint le maximum de tentatives de connexion autorisées.",
          subText: `Votre accès est bloqué jusqu'à ${date !== "-" ? `à ${date}.` : "demain."}. Revenez d'ici quelques minutes.`,
        });
      }
    }
    setLoading(false);
  };

  React.useEffect(() => {
    if (email && password) setDisabled(false);
    else setDisabled(true);
  }, [email, password]);
  return (
    <div className="flex bg-[#F9F6F2] py-6">
      <div className="mx-auto my-0 basis-[50%] bg-white px-[102px] py-[60px]">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        <div className="mb-1 text-[32px] font-bold text-[#161616]">Me connecter</div>
        <div className="mb-2 flex items-center gap-4">
          <RightArrow />
          <div className="text-[21px] font-bold text-[#161616]">Mon espace volontaire</div>
        </div>
        <div className="mb-1 flex flex-col gap-1 py-1">
          <label className="text-base text-[#161616]">E-mail</label>
          <Input value={email} onChange={(e) => setEmail(e)} />
        </div>
        <div className="flex flex-col gap-1 pb-4">
          <label className="text-base text-[#161616]">Mot de passe</label>
          <div className="flex w-full items-center rounded-t-[4px] border-b-[2px] border-[#3A3A3A] bg-[#EEEEEE] px-4 py-2">
            <input className="w-full bg-inherit" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
            {showPassword ? <EyeOff className="cursor-pointer" onClick={() => setShowPassword(false)} /> : <Eye className="cursor-pointer" onClick={() => setShowPassword(true)} />}
          </div>
        </div>
        <div className="cursor-pointer pb-4 text-base font-normal text-[#000091] underline" onClick={() => history.push("/auth/forgot")}>
          Mot de passe perdu ?
        </div>
        <div className="flex w-full justify-end">
          <button
            disabled={disabled || loading}
            className="flex cursor-pointer items-center justify-center bg-[#000091] px-3 py-2 text-white hover:border hover:border-[#000091] hover:bg-white hover:!text-[#000091]  disabled:cursor-default disabled:border-0 disabled:bg-[#E5E5E5] disabled:!text-[#929292]"
            onClick={onSubmit}>
            Connexion
          </button>
        </div>
        <hr className="mt-4 border-b-1 text-[#E5E5E5]" />
        <div className="mt-4 text-[#E5E5E5]">
          <div className="mt-4 mb-2 text-center text-xl font-bold text-[#161616]">Vous n&apos;êtes pas encore inscrit(e) ?</div>
          <p className="text-center text-base text-[#161616]">
            Les inscriptions sont clôturées pour le premier semestre 2023. Soyez informé(e) lors de l’ouverture des prochaines inscriptions.
          </p>
          <div className="flex justify-center mt-3">
            <a
              className="plausible-event-name=Clic+LP+Inscription flex cursor-pointer text-base items-center text-center justify-center border-[1px] border-[#000091] px-3 py-2 text-[#000091] hover:bg-[#000091] hover:text-white"
              href="https://www.snu.gouv.fr/?utm_source=moncompte&utm_medium=website&utm_campaign=fin+inscriptions+2023&utm_content=cta+notifier#formulaire">
              Recevoir une alerte par email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
