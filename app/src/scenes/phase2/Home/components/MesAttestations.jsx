import React, { useState } from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { RiAttachmentLine } from "react-icons/ri";
import { HiChevronDown } from "react-icons/hi";
import { useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import { download } from "snu-lib";
import { apiURL } from "@/config";
import API from "@/services/api";

// const sendAttestation = async (doc, young) => {
//   // TODO: move this to the backend
//   const res = await fetch(`/young/${young._id}/documents/certificate/${doc}/send-email`, {
//     headers: { "Content-Type": "application/json" },
//     Authorization: `JWT ${young.token}`,
//     method: "POST",
//     body: JSON.stringify({ fileName: `${young.firstName} ${young.lastName} - attestation ${doc}.pdf` }),
//   });
//   const { ok, error } = await res.json();
//   if (!ok) throw new Error(error.message);
// };

async function fetchAttestation(doc, young) {
  const res = await fetch(`${apiURL}/young/${young._id}/documents/certificate/${doc}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `JWT ${API.getToken()}`,
    },
    method: "POST",
  });
  if (!res.ok) throw new Error("Erreur lors du téléchargement de l'attestation");
  const file = await res.blob();
  return file;
}

export default function MesAttestations() {
  const { young } = useSelector((state) => state.Auth);

  // const sendAttestationMutation = useMutation({
  //   mutationFn: (doc) => sendAttestation(doc, young),
  //   onError: () => toastr.error("Une erreur est survenue lors de l'envoi de l'attestation"),
  //   onSuccess: () => toastr.success(`Document envoyé à ${young.email}`),
  // });

  const downloadAttestation = useMutation({
    mutationFn: () => fetchAttestation("2", young),
    onError: () => toastr.error("Une erreur est survenue lors du téléchargement de l'attestation"),
    onSuccess: (file) => download(file, `${young.firstName} ${young.lastName} - attestation.pdf`),
  });

  return (
    <div className="max-w-6xl px-3 mx-auto">
      <h2 className="font-bold mx-0 my-12">Mes attestations</h2>

      <div className="mt-8 border rounded-xl p-3 mx-auto">
        <div className="grid grid-rows-2 md:grid-rows-1 md:grid-cols-2">
          <div className="flex gap-2 md:border-r border-b md:border-b-0 pb-[0.75rem] md:pb-0">
            <RiAttachmentLine className="text-gray-400 text-xl pt-1 flex-none" />
            <div>
              <p>Attestation de réalisation phase 2</p>
              <Popover className="relative">
                <PopoverButton className="text-blue-600">
                  Télécharger
                  <HiChevronDown className="inline-block text-xl" />
                </PopoverButton>
                <PopoverPanel anchor="bottom" className="flex flex-col">
                  <button onClick={() => downloadAttestation.mutate("2")}>{downloadAttestation.isPending ? "Téléchargement en cours..." : "Télécharger"}</button>
                </PopoverPanel>
              </Popover>
            </div>
          </div>
          <div className="flex gap-4 items-center px-3 pt-[0.75rem] md:p-0">
            <div className="rounded-full bg-blue-france-sun-113 flex justify-center w-6 h-6 flex-none">
              <p className="text-white text-sm">2</p>
            </div>
            <p>Attestation de réalisation SNU</p>
          </div>
        </div>
      </div>
    </div>
  );
}
