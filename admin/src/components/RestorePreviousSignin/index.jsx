import React from "react";
import { useSelector } from "react-redux";
import { restorePreviousSignin } from "@/utils/signinAs";
import Icon from "./Icon";
import { useHistory } from "react-router-dom";

export default function RestorePreviousSignin() {
  const previousSigninToken = useSelector((state) => state.Auth.previousSigninToken);
  const history = useHistory();

  const onClick = () => {
    restorePreviousSignin();
    history.push("/");
  };

  if (!previousSigninToken) return null;

  return (
    <div className="flex justify-end items-center py-2 px-8 bg-pink-600 font-medium text-xs text-white sticky top-0 z-50 h-[5vh]">
      <span>Vous avez pris la place de cet utilisateur, restez vigilant dans vos actions.</span>
      <button className="flex justify-center items-center rounded bg-pink-700 ml-2 py-[6px] px-[10px] hover:bg-pink-800" onClick={onClick}>
        <Icon />
        <span className="ml-[6px]">Reprendre ma place</span>
      </button>
    </div>
  );
}
