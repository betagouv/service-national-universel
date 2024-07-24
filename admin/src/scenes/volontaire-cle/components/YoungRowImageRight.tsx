import React from "react";
import { useHistory } from "react-router-dom";
import { HiOutlineX, HiOutlineCheck } from "react-icons/hi";
import { Checkbox } from "@mui/material";

import { YOUNG_STATUS, getAge } from "snu-lib";
import { Badge } from "@snu/ds/admin";

export default function YoungRowImageRight({ young }) {
  const history = useHistory();

  return (
    <tr className="flex items-center py-3 px-4 hover:bg-gray-50">
      <td className="w-[5%]">
        <Checkbox
          sx={{
            "& .MuiSvgIcon-root": {
              fontSize: 24,
              color: "#d1d5db",
            },
            "&.Mui-checked .MuiSvgIcon-root": {
              color: "#2563eb",
            },
            "&:hover": {
              backgroundColor: "transparent",
            },
            "& .MuiTouchRipple-root": {
              display: "none",
            },
          }}
        />
      </td>
      <td className="w-[40%] table-cell truncate cursor-pointer" onClick={() => history.push(`/volontaire/${young._id}`)}>
        <span className="font-bold text-gray-900 text-base leading-5">{young.status !== YOUNG_STATUS.DELETED ? `${young.firstName} ${young.lastName}` : "Compte supprimé"}</span>
        <p className="text-xs text-gray-500 leading-5">
          {young.birthdateAt ? `${getAge(young.birthdateAt)} ans` : null}{" "}
          {young.status !== YOUNG_STATUS.DELETED && young.department ? `• ${young.city || ""} (${young.department || ""})` : null}
        </p>
      </td>
      <td className="flex w-[45%] cursor-pointer items-center gap-4 " onClick={() => history.push(`/classes/${young.classeId}`)}>
        <div className="flex w-full flex-col justify-center">
          <div className="m-0 table w-full table-fixed border-collapse">
            <div className="table-cell truncate font-bold text-gray-900">{young?.classe?.name}</div>
          </div>
          <div className="m-0 mt-1 table w-full table-fixed border-collapse">
            <div className="table-cel truncate text-xs leading-5 text-gray-500 ">id: {young?.classe?.uniqueKeyAndId}</div>
          </div>
        </div>
      </td>
      <td className="flex w-[10%] gap-2">
        <Badge
          title={<HiOutlineX size={20} />}
          className="rounded-[50%] !p-0 !w-10 !h-10 border text-gray-500 border-gray-300 !bg-white hover:!bg-gray-200 hover:!border-red-400 hover:text-red-600"
        />
        <Badge
          title={<HiOutlineCheck size={20} />}
          className="rounded-[50%] !p-0 !w-10 !h-10 text-white !bg-blue-600 hover:!bg-white hover:!text-blue-600 hover:!border hover:!border-blue-600"
        />
      </td>
    </tr>
  );
}
