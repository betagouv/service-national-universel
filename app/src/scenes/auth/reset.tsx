import React from "react";
import { toastr } from "react-redux-toastr";
import { Link, useHistory } from "react-router-dom";
import RightArrow from "../../assets/icons/RightArrow";
import api from "../../services/api";
import { getPasswordErrorMessage, translate } from "../../utils";
import Error from "../../components/error";
import DSFRContainer from "@/components/dsfr/layout/DSFRContainer";
import Button from "@codegouvfr/react-dsfr/Button";
import { InputPassword } from "@snu/ds/dsfr";
import { ERRORS } from "snu-lib";

type Errors = {
  text?: string;
  subText?: string;
  code?: string;
  password?: string;
  passwordConfirm?: string;
};

/**
 * Les deux refus les plus fréquents en production (logs du 1er au 5/11/2026) : le nouveau mot de passe
 * identique à l'ancien — typiquement après une réinitialisation imposée, quand le volontaire retape le
 * mot de passe qu'il connaît — et le lien périmé, remplacé par un plus récent ou déjà utilisé.
 */
function resetErrorMessage(code?: string): Errors {
  if (code === ERRORS.NEW_PASSWORD_IDENTICAL_PASSWORD) {
    return {
      code,
      text: "Ce mot de passe est celui que vous utilisiez déjà.",
      subText: "Par mesure de sécurité, il ne peut plus être utilisé : choisissez-en un nouveau, différent de l'ancien.",
    };
  }
  if (code === ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID) {
    return {
      code,
      text: "Ce lien de réinitialisation n'est plus valable.",
      subText:
        "Il est valable 2 heures et ne sert qu'une fois. Chaque nouvelle demande remplace le lien précédent : utilisez uniquement le dernier e-mail reçu, ou demandez un nouveau lien.",
    };
  }
  return { code, text: `Une erreur s'est produite : ${translate(code)}` };
}

function validate(password: string, passwordConfirm: string): Errors {
  const errors: Errors = {};
  if (password && getPasswordErrorMessage(password)) {
    errors.password = getPasswordErrorMessage(password);
  }
  if (password && passwordConfirm && password !== passwordConfirm) {
    errors.passwordConfirm = "Les mots de passe ne correspondent pas";
  }
  return errors;
}

export default function Reset() {
  const [loading, setLoading] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [passwordConfirm, setPasswordConfirm] = React.useState("");
  const disabled = !password || !passwordConfirm || loading;
  const [error, setError] = React.useState<Errors>({});
  const history = useHistory();
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validate(password, passwordConfirm);
    if (Object.keys(errors).length > 0 && password && passwordConfirm) {
      setError(errors);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/young/forgot_password_reset", { password, token });
      if (!res.ok) {
        setError(resetErrorMessage(res.code));
        setLoading(false);
        return;
      }
      toastr.success("Mot de passe changé avec succès", "Vous pouvez vous connecter avec votre nouveau mot de passe.");
      history.push("/auth");
    } catch (e) {
      setError(resetErrorMessage(e?.code));
    }
    setLoading(false);
  };

  return (
    <DSFRContainer title="Réinitialiser mon mot de passe">
      {error?.text && <Error {...error} onClose={() => setError({})} />}
      <p className="flex items-center gap-4 font-bold text-xl">
        <RightArrow className="inline-block" />
        Mon espace volontaire
      </p>
      <p className="mb-4 text-base text-[#3A3A3A]">Choisissez un nouveau mot de passe, différent de celui que vous utilisiez jusqu&apos;ici.</p>
      {error?.code === ERRORS.PASSWORD_TOKEN_EXPIRED_OR_INVALID && (
        <p className="mb-4">
          <Link to="/auth/forgot">Recevoir un nouveau lien de réinitialisation</Link>
        </p>
      )}
      <form onSubmit={(e) => handleSubmit(e)}>
        <InputPassword label="Mot de passe" name="password" value={password} onChange={setPassword} error={error?.password} />
        <InputPassword label="Confirmez votre mot de passe" name="passwordConfirm" value={passwordConfirm} onChange={setPasswordConfirm} error={error?.passwordConfirm} />
        <Button type="submit" disabled={disabled}>
          Réinitialiser
        </Button>
      </form>
      <br />
      <Link to="/auth">Retourner à la connexion</Link>
    </DSFRContainer>
  );
}
