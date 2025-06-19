import plausibleEvent from "@/services/plausible";
import { Link } from "react-router-dom";
import queryString from "query-string";
import React, { useState, useEffect } from "react";
import useAuth from "@/services/useAuth";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import { formatToActualTime, isValidRedirectUrl } from "snu-lib";
import RightArrow from "../../assets/icons/RightArrow";
import Error from "../../components/error";
import { capture, captureMessage } from "../../sentry";
import api from "../../services/api";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import { Input, InputPassword, Button } from "@snu/ds/dsfr";

interface ErrorState {
  text?: string;
  subText?: string;
}

const Signin: React.FC = () => {
  const params = queryString.parse(location.search);
  const { redirect } = params as { redirect?: string };
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<ErrorState>({});
  const [isInscriptionOpen, setInscriptionOpen] = useState<boolean>(false);
  const history = useHistory();
  const { login } = useAuth();
  const disabled = !email || !password || loading;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    try {
      const { user: young, code } = await api.post(`/young/signin`, { email, password });

      if (code === "2FA_REQUIRED") {
        plausibleEvent("2FA demandée");
        return history.push(`/auth/2fa?email=${encodeURIComponent(email)}`);
      }

      if (!young) {
        return;
      }

      plausibleEvent("Connexion réussie");
      await login(young);

      if (!redirect) {
        history.push("/");
        return;
      }

      const redirectionApproved = isValidRedirectUrl(redirect);

      if (!redirectionApproved) {
        captureMessage("Invalid redirect url", { extra: { redirect } });
        toastr.error("Erreur", "Url de redirection invalide : " + redirect);
        return history.push("/");
      }

      history.push(redirect);
    } catch (e) {
      setPassword("");
      if (e.code === "TOO_MANY_REQUESTS") {
        const date = formatToActualTime(e?.data?.nextLoginAttemptIn);
        setError({
          text: "Vous avez atteint le maximum de tentatives de connexion autorisées.",
          subText: `Votre accès est bloqué jusqu'à ${date !== "-" ? `à ${date}.` : "demain."}. Revenez d'ici quelques minutes.`,
        });
      } else {
        setError({
          text: "E-mail et/ou mot de passe incorrect(s)",
          subText: "",
        });
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchInscriptionOpen = async () => {
      try {
        const { ok, data, code } = await api.get(`/cohort-session/isInscriptionOpen`);
        if (!ok) {
          capture(Error(code));
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
    <DSFRContainer title="Me connecter" className="flex flex-col bg-[#F9F6F2] py-6">
      {error && Object.keys(error).length > 0 && <Error {...error} onClose={() => setError({})} />}
      <div className="mb-4 flex items-center gap-4">
        <RightArrow />
        <div className="text-[21px] font-bold text-[#161616]">Mon espace volontaire</div>
      </div>
      <form onSubmit={handleSubmit}>
        <Input
          label="E-mail"
          nativeInputProps={{
            value: email,
            onChange: (e) => setEmail(e.target.value),
          }}
        />
        <InputPassword label="Mot de passe" name="password" value={password} onChange={setPassword} />
        <Link to="/auth/forgot">Mot de passe perdu ?</Link>
        <div className="flex w-full justify-end">
          <Button disabled={disabled} type="submit">
            Connexion
          </Button>
        </div>
      </form>
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
              <a
                href="https://www.snu.gouv.fr/inscriptions-cloturees/"
                target="_blank"
                rel="noreferrer"
                className="text-[#161616]"
                onClick={() => plausibleEvent("Connexion/Lien vers preinscription")}>
                Recevoir une alerte par email
              </a>
            </div>
          </>
        )}
      </div>
    </DSFRContainer>
  );
};

export default Signin;
