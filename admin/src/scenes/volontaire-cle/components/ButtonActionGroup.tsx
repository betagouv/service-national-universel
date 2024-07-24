import React from "react";
import { DropdownButton } from "@snu/ds/admin";

export default function ButtonActionGroup() {
  const options = [
    {
      key: "actions",
      title: "Actions groupées",
      items: [
        {
          key: "authorized",
          render: (
            <button type="button" className="flex items-center justify-start w-full text-gray-900 hover:text-gray-700 text-sm leading-5 font-normal">
              Autorisé
            </button>
          ),
        },
        {
          key: "unauthorized",
          render: (
            <button type="button" className="flex items-center justify-start w-full text-gray-900 hover:text-gray-700 text-sm leading-5 font-normal">
              Refusé
            </button>
          ),
        },
      ],
    },
  ];
  return <DropdownButton key="edit" type="secondary" title="Actions groupées" optionsGroup={options} />;
}
