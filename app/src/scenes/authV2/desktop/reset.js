import queryString from "query-string";
import React from "react";
import { toastr } from "react-redux-toastr";
import { useHistory } from "react-router-dom";
import Eye from "../../../assets/icons/Eye";
import EyeOff from "../../../assets/icons/EyeOff";
import RightArrow from "../../../assets/icons/RightArrow";
import api from "../../../services/api";
import { getPasswordErrorMessage, translate } from "../../../utils";
import Error from "../../../components/error";

export default function Reset() {
  const [loading, setLoading] = React.useState(false);
  const [disabled, setDisabled] = React.useState(true);
  const [password, setPassword] = React.useState("");
  const [passwordConfirm, setPasswordConfirm] = React.useState("");
  const [error, setError] = React.useState({});
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const history = useHistory();

  const onSubmit = async () => {
    if (loading || disabled) return;
    setLoading(true);
    try {
      const { token } = queryString.parse(location.search);
      const res = await api.post("/young/forgot_password_reset", { password, token });
      if (!res.ok) return setError({ text: translate(res.code) });
      toastr.success("Mot de passe changé avec succès");
      history.push("/auth");
    } catch (e) {
      setError({ text: `Une erreur s'est produite : ${translate(e && e.code)}` });
    }
    setLoading(false);
  };

  React.useEffect(() => {
    let errors = {};
    if (password && getPasswordErrorMessage(password)) {
      errors.password = getPasswordErrorMessage(password);
    }
    //Password confirm
    if (password && passwordConfirm && password !== passwordConfirm) {
      errors.passwordConfirm = "Les mots de passe ne correspondent pas";
    }
    setError(errors);
    if (Object.keys(errors).length === 0 && password && passwordConfirm) {
      setDisabled(false);
    }
  }, [password, passwordConfirm]);

  return (
    <div className="bg-[#F9F6F2] py-6 flex">
      <div className="bg-white basis-[50%] mx-auto my-0 px-[102px] py-[60px]">
        {error?.text && <Error {...error} onClose={() => setError({})} />}
        <div className="text-[#161616] text-[22px] font-bold">Réinitialiser mon mot de passe</div>
        <div className="flex items-center py-4 gap-4">
          <RightArrow />
          <div className="text-[#161616] text-[17px] font-bold">Mon espace volontaire</div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[#161616] text-base">Mot de passe</label>
          <div className="flex items-center w-full bg-[#EEEEEE] px-4 py-2 border-b-[2px] border-[#3A3A3A] rounded-t-[4px]">
            <input className="w-full bg-inherit" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} />
            {showPassword ? <EyeOff className="cursor-pointer" onClick={() => setShowPassword(false)} /> : <Eye className="cursor-pointer" onClick={() => setShowPassword(true)} />}
          </div>
          <span className={`${error?.password ? "text-[#CE0500]" : "text-[#3A3A3A]"} text-xs mt-1`}>
            Il doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un symbole.
          </span>
        </div>
        <div className="flex flex-col gap-1 mt-4">
          <label className="text-[#161616] text-base">Confirmez votre mot de passe</label>
          <div className="flex items-center w-full bg-[#EEEEEE] px-4 py-2 border-b-[2px] border-[#3A3A3A] rounded-t-[4px]">
            <input className="w-full bg-inherit" type={showConfirmPassword ? "text" : "password"} value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
            {showConfirmPassword ? (
              <EyeOff className="cursor-pointer" onClick={() => setShowConfirmPassword(false)} />
            ) : (
              <Eye className="cursor-pointer" onClick={() => setShowConfirmPassword(true)} />
            )}
          </div>
          {error.passwordConfirm ? <span className="text-[#CE0500] text-sm">{error.passwordConfirm}</span> : null}
        </div>
        <div className="w-full flex justify-end">
          <button
            className={`mt-4 flex items-center justify-center p-2 cursor-pointer ${disabled || loading ? "bg-[#E5E5E5] text-[#929292]" : "bg-[#000091] text-white"}`}
            onClick={onSubmit}>
            Réinitialiser
          </button>
        </div>

        <hr className="text-[#E5E5E5] mt-4" />
        <div className="text-[#161616] text-[17px] font-bold text-center mt-4 mb-4">Retourner à la connexion</div>
        <div className="flex justify-center">
          <button className="flex items-center justify-center p-2 cursor-pointer border-[1px] border-[#000091] text-[#000091]" onClick={() => history.push("/auth")}>
            Se connecter
          </button>
        </div>
      </div>
    </div>
  );
}
