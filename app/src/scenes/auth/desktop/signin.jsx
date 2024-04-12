import plausibleEvent from "@/services/plausible";
import queryString from "query-string";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { formatToActualTime } from "snu-lib/date";
import { isValidRedirectUrl } from "snu-lib/isValidRedirectUrl";
import RightArrow from "../../../assets/icons/RightArrow";
import Error from "../../../components/error";
import { environment } from "../../../config";
import { setYoung } from "../../../redux/auth/actions";
import { capture, captureMessage } from "../../../sentry";
import api from "../../../services/api";
import { cohortsInit } from "../../../utils/cohorts";

import { Input, InputPassword, Button } from "@snu/ds/dsfr";

export default function Signin() {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [disabled, setDisabled] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState({});
  const [isInscriptionOpen, setInscriptionOpen] = React.useState(false);
  const history = useHistory();
  const declencherErreur = () => {
    try {
      // Simule une erreur
      fonctionInexistante();
    } catch (err) {
      capture(err);
    }
  };
  const envoyerMessage = () => {
    try {
      // Simule une erreur
      throw new Error("Erreur déclenchée pour test Sentry JEUNE");
    } catch (err) {
      capture(err);
    }
  };
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
      const { user: young, token, code } = await api.post(`/young/signin`, { email, password });
      if (code === "2FA_REQUIRED") {
        plausibleEvent("2FA demandée");
        return history.push(`/auth/2fa?email=${encodeURIComponent(email)}`);
      }
      if (young && token) {
        plausibleEvent("Connexion réussie");
        api.setToken(token);
        dispatch(setYoung(young));
        await cohortsInit();
        const redirectionApproved = environment === "development" ? redirect : isValidRedirectUrl(redirect);
        if (!redirectionApproved) {
          captureMessage("Invalid redirect url", { extra: { redirect } });
          toastr.error("Url de redirection invalide : " + redirect);
          return history.push("/");
        }
        return (window.location.href = redirect);
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
    <div className="flex bg-[#F9F6F2] py-6">
      <div className="mx-auto w-full bg-white px-[1rem] py-[2rem] shadow-sm md:w-[56rem] md:px-[6rem] md:pt-[3rem]">
        {Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
        <div className="mb-4 text-[32px] font-bold text-[#161616]">Me connecter</div>
        <div className="mb-4 flex items-center gap-4">
          <RightArrow />
          <div className="text-[21px] font-bold text-[#161616]">Mon espace volontaire</div>
        </div>
        <Input
          label="E-mail"
          nativeInputProps={{
            value: email,
            onChange: (e) => setEmail(e.target.value),
          }}
        />
        <InputPassword label="Mot de passe" value={password} onChange={setPassword} />
        <a href="/auth/forgot">Mot de passe perdu ?</a>
        <div className="flex w-full justify-end">
          <Button disabled={disabled || loading} onClick={onSubmit}>
            Connexion
          </Button>
          <button onClick={declencherErreur}>Déclencher une Erreur</button>
        </div>
        <hr className="mt-3 border-b-1 text-[#E5E5E5]" />
        <div className="mt-3 text-[#E5E5E5] space-y-3">
          <div className="mt-3 mb-2 text-center text-xl font-bold text-[#161616]">Vous n&apos;êtes pas encore inscrit(e) ?</div>
          {/* <p className="text-center text-base text-[#161616] my-3">Les inscriptions sont actuellement fermées.</p> */}
          {isInscriptionOpen ? (
            <div className="flex w-full justify-center">
              <Button
                priority="secondary"
                onClick={() => {
                  plausibleEvent("Connexion/Lien vers preinscription");
                  return history.push("/preinscription");
                }}>
                Commencer mon inscription
              </Button>
            </div>
          ) : (
            <>
              <p className="text-center text-base text-[#161616] m-3">Soyez informé(e) lors de l'ouverture des prochaines inscriptions.</p>
              <div className="flex w-full justify-center">
                <Button
                  priority="secondary"
                  onClick={() => {
                    plausibleEvent("Connexion/Lien vers preinscription");
                    return window.location.replace(
                      "https://www.snu.gouv.fr/?utm_source=moncompte&utm_medium=website&utm_campaign=fin+inscriptions+2023&utm_content=cta+notifier#formulaire",
                    );
                  }}>
                  Recevoir une alerte par email
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
