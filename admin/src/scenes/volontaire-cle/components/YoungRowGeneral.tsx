import React from "react";
import { Link, useHistory } from "react-router-dom";
import { IoFlashOutline } from "react-icons/io5";
import { HiUsers } from "react-icons/hi";

import { YOUNG_STATUS, getAge } from "snu-lib";
import { Badge, DropdownButton } from "@snu/ds/admin";
import { translate } from "@/utils";

export default function YoungRowGeneral({ young }) {
  const history = useHistory();

  return (
    <tr className="flex items-center py-3 px-4 hover:bg-gray-50">
      <td className="w-[30%] table-cell truncate cursor-pointer" onClick={() => history.push(`/volontaire/${young._id}`)}>
        <span className="font-bold text-gray-900 text-base leading-5">{young.status !== YOUNG_STATUS.DELETED ? `${young.firstName} ${young.lastName}` : "Compte supprimé"}</span>
        <p className="text-xs text-gray-500 leading-5">
          {young.birthdateAt ? `${getAge(young.birthdateAt)} ans` : null}{" "}
          {young.status !== YOUNG_STATUS.DELETED && young.department ? `• ${young.city || ""} (${young.department || ""})` : null}
        </p>
      </td>
      <td className="flex w-[20%] flex-col gap-2">
        <Badge title={young.cohort} leftIcon={<HiUsers color="#EC4899" size={20} />} />
      </td>
      <td className="flex w-[20%] cursor-pointer items-center gap-4 " onClick={() => history.push(`/classes/${young.classeId}`)}>
        <div className="flex w-full flex-col justify-center">
          <div className="m-0 table w-full table-fixed border-collapse">
            <div className="table-cell truncate font-bold text-gray-900">{young?.classe?.name}</div>
          </div>
          <div className="m-0 mt-1 table w-full table-fixed border-collapse">
            <div className="table-cel truncate text-xs leading-5 text-gray-500 ">id: {young?.classe?.uniqueKeyAndId}</div>
          </div>
        </div>
      </td>
      <td className="w-[20%] flex justify-center">
        <Badge title={translate(YOUNG_STATUS[young.status])} status={young.status} />
      </td>
      <td className="flex w-[10%] flex-col gap-2 justify-center">
        <DropdownButton
          title={<IoFlashOutline size={20} />}
          mode={"badge"}
          rightIcon={false}
          buttonClassName={"rounded-[50%] !p-0 !w-10 !h-10 border-none !bg-gray-100 hover:!bg-white hover:text-blue-600"}
          position="right"
          optionsGroup={[
            {
              key: "actions",
              title: "",
              items: [
                {
                  key: "view",
                  render: (
                    <Link to={`/volontaire/${young._id}`} className="appearance-none w-full">
                      <p>Consulter le profil</p>
                    </Link>
                  ),
                },
              ].filter(Boolean),
            },
          ]}
        />
      </td>
    </tr>
  );
}
