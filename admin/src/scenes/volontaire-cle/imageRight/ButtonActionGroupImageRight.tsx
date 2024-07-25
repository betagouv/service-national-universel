import React, { useState } from "react";
import { DropdownButton, ModalConfirmation } from "@snu/ds/admin";
import { HiOutlineClipboardCheck } from "react-icons/hi";

export default function ButtonActionGroupImageRight() {
  const [showModale, setShowModale] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  return (
    <>
      <DropdownButton
        key="edit"
        type="secondary"
        title="Actions groupées"
        optionsGroup={[
          {
            key: "actions",
            title: "Actions groupées",
            items: [
              {
                key: "authorized",
                render: (
                  <button
                    type="button"
                    className="flex items-center justify-start w-full text-gray-900 hover:text-gray-700 text-sm leading-5 font-normal"
                    onClick={() => {
                      setAuthorized(true);
                      setShowModale(true);
                    }}>
                    Autorisé
                  </button>
                ),
              },
              {
                key: "unauthorized",
                render: (
                  <button
                    type="button"
                    className="flex items-center justify-start w-full text-gray-900 hover:text-gray-700 text-sm leading-5 font-normal"
                    onClick={() => {
                      setAuthorized(false);
                      setShowModale(true);
                    }}>
                    Refusé
                  </button>
                ),
              },
            ],
          },
        ]}
      />
      <ModalConfirmation
        isOpen={showModale}
        onClose={() => {
          setShowModale(false);
        }}
        className="md:max-w-[600px]"
        icon={<HiOutlineClipboardCheck className="text-gray-900 bg-gray-100 rounded-full p-2" size={40} />}
        title="Récolte des droits à l’image"
        text={
          authorized ? (
            <p className="text-base leading-6 font-normal text-gray-900">
              Vous souhaitez déclarer que vous avez reçu les autorisations écrites des représentants légaux pour les droits à l’image de <span className="font-bold">X élèves</span>
              . Conservez bien ces autorisations écrites dans le dossier des élèves au sein de l’établissement.
            </p>
          ) : (
            <p className="text-base leading-6 font-normal text-gray-900">
              Vous souhaitez déclarer que vous avez reçu les refus écrits des représentants légaux pour les droits à l’image de <span className="font-bold">X élèves</span>.
              Conservez bien ces refus écrits dans le dossier des élèves au sein de l’établissement.
            </p>
          )
        }
        actions={[
          { title: "Annuler", isCancel: true },
          {
            title: "Confirmer",
            onClick: () => {
              console.log("confirmed");
              setShowModale(false);
            },
          },
        ]}
      />
    </>
  );
}
