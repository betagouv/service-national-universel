import React from "react";
import { HiArrowRight } from "react-icons/hi";
import { useSelector } from "react-redux";
import cx from "classnames";
import ReactTooltip from "react-tooltip";

import { formatLongDateFR, translateAction, ROLES } from "snu-lib";
import { translateHistory, translateModelFields } from "@/utils";
import UserCard from "@/components/UserCard";
import { AuthState } from "@/redux/auth/reducer";
import { getAuthorTooltip } from "@/utils";

import { ClasseYoungPatchesType, ClassePatchesType } from "./types";

interface ClasseProps {
  type: "classe";
  patch: ClassePatchesType;
}

interface YoungProps {
  type: "young";
  patch: ClasseYoungPatchesType;
}

type HistoryRowProps = ClasseProps | YoungProps;

export default function HistoryRow({ patch, type }: HistoryRowProps) {
  const user = useSelector((state: AuthState) => state.Auth.user);
  if (type === "young" && patch.user) {
    if (!patch.user.role) {
      if (patch.user.email) patch.user.role = "Volontaire";
    }
  }

  function getLink(patch) {
    if (patch.oldStudent && [ROLES.ADMINISTRATEUR_CLE, ROLES.REFERENT_CLASSE].includes(user.role)) return "";
    if (patch.young) return `/volontaire/${patch.ref}`;
    return "";
  }

  const tooltipActionIds = patch.ops.map((_, i) => `tooltip-action-${patch._id || ""}-${i}`);
  const tooltipAvantIds = patch.ops.map((_, i) => `tooltip-avant-${patch._id || ""}-${i}`);
  const tooltipApresIds = patch.ops.map((_, i) => `tooltip-apres-${patch._id || ""}-${i}`);
  const tooltipAuteurIds = patch.ops.map((_, i) => `tooltip-auteur-${patch._id || ""}-${i}`);

  return (
    <>
      {patch.ops.map((op, index) => (
        <tr key={index} className="flex cursor-default items-center px-4 py-3 hover:bg-slate-50">
          <td data-tip data-for={tooltipActionIds[index]} className="w-[30%]">
            {type === "classe" ? (
              <>
                <ReactTooltip id={tooltipActionIds[index]} type="light" place="top" effect="solid" className="custom-tooltip-radius rounded-md !opacity-100 !shadow-md !z-50">
                  <div className="text-gray-700 text-xs font-[400] text-center mb-1">{translateModelFields("classe", op.path.slice(1))}</div>
                </ReactTooltip>
                <p className="truncate hover:overflow-visible text-gray-900 font-[700] text-base leading-5">{translateModelFields("classe", op.path.slice(1))}</p>
                <p className="text-gray-500 text-xs leading-5 font-medium">
                  {translateAction(op.op)} • {formatLongDateFR(patch.date)}
                </p>
              </>
            ) : (
              <>
                <ReactTooltip id={tooltipActionIds[index]} type="light" place="top" effect="solid" className="custom-tooltip-radius rounded-md !opacity-100 !shadow-md !z-50">
                  <div className="text-gray-700 text-xs font-[400] text-center mb-1">
                    {patch.young.firstName} {patch.young.lastName}
                  </div>
                </ReactTooltip>
                <a
                  href={getLink(patch)}
                  target="_blank"
                  rel="noreferrer"
                  className={cx("group flex w-full flex-col", {
                    "hover:cursor-pointer": getLink(patch) !== "",
                    "hover:text-inherit hover:cursor-default": getLink(patch) === "",
                  })}>
                  <p
                    className={cx("truncate-x text-gray-900 font-[700] text-base leading-5", {
                      "hover:text-blue-600": getLink(patch) !== "",
                    })}>
                    {patch.young.firstName} {patch.young.lastName}
                  </p>
                  <p className="text-gray-500 text-xs leading-5 font-medium">
                    {translateAction(op.op)} • {formatLongDateFR(patch.date)}
                  </p>
                </a>
              </>
            )}
          </td>
          <td data-tip data-for={tooltipAvantIds[index]} className="w-[23%]">
            <ReactTooltip id={tooltipAvantIds[index]} type="light" place="top" effect="solid" className="custom-tooltip-radius rounded-md !opacity-100 !shadow-md !z-50">
              <div className="text-gray-700 text-xs font-[400] text-center mb-1">{translateHistory(op.path, op.originalValue || "Vide")}</div>
            </ReactTooltip>
            {(type !== "young" || !patch.oldStudent) && <p className="truncate text-gray-400 text-sm leading-5">{translateHistory(op.path, op.originalValue || "Vide")}</p>}
          </td>
          <td data-tip data-for={tooltipApresIds[index]} className="w-[23%] flex items-center gap-2">
            {type === "young" && patch.oldStudent ? (
              <p className="text-red-700">A quitté la classe</p>
            ) : (
              <>
                <ReactTooltip id={tooltipApresIds[index]} type="light" place="top" effect="solid" className="custom-tooltip-radius rounded-md !opacity-100 !shadow-md !z-50">
                  <div className="text-gray-700 text-xs font-[400] text-center mb-1">{translateHistory(op.path, op.value)}</div>
                </ReactTooltip>
                <HiArrowRight size={16} className="mt-0.5" />
                <p className="truncate text-gray-900">{translateHistory(op.path, op.value)}</p>
              </>
            )}
          </td>
          <td data-tip data-for={tooltipAuteurIds[index]} className="w-[23%]">
            <ReactTooltip id={tooltipAuteurIds[index]} type="light" place="top" effect="solid" className="custom-tooltip-radius rounded-md !opacity-100 !shadow-md !z-50">
              <div className="text-gray-700 text-xs font-[400] text-center mb-1">{getAuthorTooltip(patch.user)}</div>
            </ReactTooltip>
            <UserCard user={patch.user} />
          </td>
        </tr>
      ))}
    </>
  );
}
