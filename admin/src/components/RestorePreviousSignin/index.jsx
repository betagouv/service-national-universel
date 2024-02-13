import React from "react";
import { useSelector } from "react-redux";
import { restorePreviousSignin } from "@/utils/signinAs";
import Icon from "./Icon";

export default function RestorePreviousSignin() {
  const previousSigninToken = useSelector((state) => state.Auth.previousSigninToken);

  if (!previousSigninToken) return null;

  return (
    <div className="flex justify-between items-center py-2 px-8 bg-pink-600 font-medium text-xs text-white">
      <span>Vous avez pris la place de cet utilisateur, restez vigilent dans vos actions.</span>
      <button className="flex justify-center items-center rounded bg-pink-700 py-[6px] px-[10px] hover:bg-pink-800" onClick={restorePreviousSignin}>
        <Icon />
        <span className="ml-[6px]">Reprendre ma place</span>
      </button>
    </div>
  );
}
