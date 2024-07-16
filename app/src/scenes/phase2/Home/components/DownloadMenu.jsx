import { useMutation } from "@tanstack/react-query";
import React from "react";
import { useSelector } from "react-redux";
import { fetchAttestation } from "../../repo";
import { download } from "snu-lib";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { HiChevronDown, HiDownload, HiMail } from "react-icons/hi";
import { toastr } from "react-redux-toastr";

export default function DownloadMenu({ template }) {
  const { young } = useSelector((state) => state.Auth);

  const downloadAttestation = useMutation({
    mutationFn: (template) => fetchAttestation(young._id, template, false),
    onError: () => toastr.error("Une erreur est survenue lors du téléchargement de l'attestation"),
    onSuccess: (file) => download(file, `${young.firstName} ${young.lastName} - attestation.pdf`),
  });

  const sendAttestation = useMutation({
    mutationFn: (template) => fetchAttestation(young._id, template, true),
    onError: () => toastr.error("Une erreur est survenue lors de l'envoi de l'attestation"),
    onSuccess: () => toastr.success("Envoi réalisé"),
  });

  return (
    <PopoverPanel
      transition
      className="absolute left-1/2 z-10 mt-2 flex w-screen max-w-max -translate-x-1/2 px-4 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in">
      <div className="w-screen max-w-md flex-auto overflow-hidden rounded-3xl bg-white text-sm leading-6 shadow-lg ring-1 ring-gray-900/5">
        <div className="p-3">
          <div className="group relative flex gap-x-6 rounded-lg p-3 hover:bg-gray-50">
            <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
              <HiDownload aria-hidden="true" className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
            </div>
            <div>
              <button onClick={() => downloadAttestation.mutate(template)} disabled={downloadAttestation.isLoading} className="font-semibold text-gray-900">
                {downloadAttestation.isPending ? "Téléchargement en cours..." : "Télécharger"}
                <span className="absolute inset-0" />
              </button>
              <p className="mt-1 text-gray-600">Sur cet appareil</p>
            </div>
          </div>

          <div className="group relative flex gap-x-6 rounded-lg p-3 hover:bg-gray-50">
            <div className="mt-1 flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
              <HiMail aria-hidden="true" className="h-6 w-6 text-gray-600 group-hover:text-blue-600" />
            </div>
            <div className="w-4/5">
              <button onClick={() => sendAttestation.mutate(template)} disabled={sendAttestation.isLoading} className="font-semibold text-gray-900">
                Envoyer par email
                <span className="absolute inset-0" />
              </button>
              <p className="mt-1 text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis ">À {young.email}</p>
            </div>
          </div>
        </div>
      </div>
    </PopoverPanel>
  );
}
