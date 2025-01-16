import queryString from "query-string";
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

type Errors = {
  text?: string;
  password?: string;
  passwordConfirm?: string;
};

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validate(password, passwordConfirm);
    if (Object.keys(errors).length > 0 && password && passwordConfirm) {
      setError(errors);
      return;
    }

    setLoading(true);
    try {
      const { token } = queryString.parse(location.search);
      const res = await api.post("/young/forgot_password_reset", { password, token });
      if (!res.ok) return setError({ text: translate(res.code) });
      toastr.success("Mot de passe changé avec succès", "");
      history.push("/auth");
    } catch (e) {
      setError({ text: `Une erreur s'est produite : ${translate(e && e.code)}` });
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

      <form onSubmit={(e) => handleSubmit(e)}>
        <InputPassword label="Mot de passe" name="password" value={password} onChange={setPassword} error={error?.password} />
        <InputPassword label="Confirmez votre mot de passe" name="passwordConfirm" value={passwordConfirm} onChange={setPasswordConfirm} error={error?.passwordConfirm} />
        <Button type="submit" disabled={disabled}>
          Réinitialiser
        </Button>
      </form>
      <br />
      <Link to="/auth">Retourner à la connexion</Link>
      <br />
      <br />
    </DSFRContainer>
  );
}
