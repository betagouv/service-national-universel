import plausibleEvent from "@/services/plausible";
import queryString from "query-string";
import React from "react";
import { useDispatch } from "react-redux";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { formatToActualTime } from "snu-lib";
import { isValidRedirectUrl } from "snu-lib";
import RightArrow from "../../../assets/icons/RightArrow";
import Error from "../../../components/error";
import { setYoung } from "../../../redux/auth/actions";
import { capture, captureMessage } from "../../../sentry";
import api from "../../../services/api";
import { cohortsInit } from "../../../utils/cohorts";

import { Input, InputPassword, Button } from "@snu/ds/dsfr";

export default function Signin() {
  const params = queryString.parse(location.search);
  const { redirect } = params;
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState({});
  const [isInscriptionOpen, setInscriptionOpen] = React.useState(false);
  const history = useHistory();
  const dispatch = useDispatch();
  const disabled = !email || !password || loading;

  const onSubmit = async () => {
    setLoading(true);
    try {
      const { user: young, code } = await api.post(`/young/signin`, { email, password });

      if (code === "2FA_REQUIRED") {
        plausibleEvent("2FA demandée");
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
      if (e.code === "TOO_MANY_REQUESTS") {
        let date = formatToActualTime(e?.data?.nextLoginAttemptIn);
        setError({
          text: "Vous avez atteint le maximum de tentatives de connexion autorisées.",
          subText: `Votre accès est bloqué jusqu'à ${date !== "-" ? `à ${date}.` : "demain."}. Revenez d'ici quelques minutes.`,
        });
      } else {
        setError({
          text: "E-mail et/ou mot de passe incorrect(s)",
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
          <Button disabled={disabled} onClick={onSubmit}>
            Connexion
          </Button>
        </div>
        <hr className="mt-3 border-b-1 text-[#E5E5E5]" />
        <div className="mt-3 text-[#E5E5E5] space-y-3">
          <div className="mt-3 mb-2 text-center text-xl font-bold text-[#161616]">Vous n&apos;êtes pas encore inscrit(e) ?</div>
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
