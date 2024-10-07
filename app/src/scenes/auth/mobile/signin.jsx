import plausibleEvent from "@/services/plausible";
import queryString from "query-string";
import React from "react";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";
import { formatToActualTime, isValidRedirectUrl } from "snu-lib";
import Eye from "../../../assets/icons/Eye";
import EyeOff from "../../../assets/icons/EyeOff";
import RightArrow from "../../../assets/icons/RightArrow";
import Input from "../../../components/dsfr/forms/input";
import Error from "../../../components/error";
import { setYoung } from "../../../redux/auth/actions";
import { capture, captureMessage } from "../../../sentry";
import api from "../../../services/api";
import { cohortsInit } from "../../../utils/cohorts";

export default function Signin() {
  const params = queryString.parse(location.search);
  const { redirect, disconnected } = params;
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(
    disconnected === "1"
      ? {
          text: "Votre session a expiré",
          subText: "Merci de vous reconnecter.",
        }
      : {},
  );
  const [isInscriptionOpen, setInscriptionOpen] = React.useState(false);
  const history = useHistory();
  const dispatch = useDispatch();
  const disabled = !email || !password || loading;

  const onSubmit = async () => {
    setLoading(true);
    try {
      const { user: young, code } = await api.post(`/young/signin`, { email, password });

      if (code === "2FA_REQUIRED") {
        return history.push(`/auth/2fa?email=${encodeURIComponent(email)}`);
      }

      if (!young) {
        console.log("no young", young);
        return;
      }

      plausibleEvent("Connexion réussie");
      dispatch(setYoung(young));
      await cohortsInit();

      if (!redirect) {
        history.push("/");
        return;
      }

      const redirectionApproved = isValidRedirectUrl(redirect);

      if (!redirectionApproved) {
        captureMessage("Invalid redirect url", { extra: { redirect } });
        toastr.error("Url de redirection invalide : " + redirect);
        return history.push("/");
      }
      history.push(redirect);
    } catch (e) {
      setPassword("");
      setError({ text: "E-mail et/ou mot de passe incorrect(s)" });
      if (e.code === "TOO_MANY_REQUESTS") {
        let date = formatToActualTime(e?.data?.nextLoginAttemptIn);
        setError({
          text: "Vous avez atteint le maximum de tentatives de connexion autorisées.",
          subText: `Votre accès est bloqué jusqu'à ${date !== "-" ? `à ${date}.` : "demain."}. Revenez d'ici quelques minutes.`,
        });
      }
    }
    setLoading(false);
  };

  React.useEffect(() => {
    const fetchInscriptionOpen = async () => {
      try {
        const { ok, data, code } = await api.get(`/cohort-session/isInscriptionOpen`);
        if (!ok) {
          capture(new Error(code));
          return toastr.error("Oups, une erreur est survenue", code);
        }
        setInscriptionOpen(data);
      } catch (e) {
        setInscriptionOpen(false);
      }
    };
    fetchInscriptionOpen();
  }, []);

  return (
    <>
      <div className="bg-white px-4 pt-4 pb-12">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        <div className="text-[22px] font-bold text-[#161616]">Me connecter</div>
        <div className="flex items-center gap-4 py-4">
          <RightArrow />
          <div className="text-[17px] font-bold text-[#161616]">Mon espace volontaire</div>
        </div>
        <div className="flex flex-col gap-1 py-4">
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
        <div className="pb-4 text-base font-normal text-[#000091]" onClick={() => history.push("/auth/forgot")}>
          Mot de passe perdu ?
        </div>
        <button
          disabled={disabled}
          className={`flex w-full cursor-pointer items-center justify-center p-2 ${disabled || loading ? "bg-[#E5E5E5] text-[#929292]" : "bg-[#000091] text-white"}`}
          onClick={onSubmit}>
          Connexion
        </button>
        <hr className="mt-4 border-b-1 text-[#E5E5E5]" />
        <div className="mt-4 text-[#E5E5E5]">
          <div className="mt-4 mb-3 text-center text-[17px] font-bold text-[#161616]">Vous n&apos;êtes pas encore inscrit(e) ?</div>
          {/* <p className="text-center text-base text-[#161616] mb-4">Les inscriptions sont actuellement fermées.</p> */}
          {isInscriptionOpen ? (
            <Link onClick={() => plausibleEvent("Connexion/Lien vers preinscription")} to="/preinscription">
              <p className="w-full my-4 text-center p-2 text-blue-france-sun-113 border-[1px] border-blue-france-sun-113 hover:bg-blue-france-sun-113">Commencer mon inscription</p>
            </Link>
          ) : (
            <>
              <p className="text-center text-base text-[#161616] mb-4">Soyez informé(e) lors de l'ouverture des prochaines inscriptions.</p>
              <a
                className="plausible-event-name=Clic+LP+Inscription flex cursor-pointer text-base items-center text-center justify-center border-[1px] border-[#000091] p-2 text-[#000091] hover:bg-[#000091] hover:text-white"
                href="https://www.snu.gouv.fr/?utm_source=moncompte&utm_medium=website&utm_campaign=fin+inscriptions+2023&utm_content=cta+notifier#formulaire">
                Recevoir une alerte par email
              </a>
            </>
          )}
        </div>
      </div>
    </>
  );
}
