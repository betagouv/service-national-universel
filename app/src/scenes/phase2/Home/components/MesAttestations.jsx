import React from "react";
import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import { RiAttachmentLine } from "react-icons/ri";
import { HiChevronDown } from "react-icons/hi";
import { useSelector } from "react-redux";
import { useMutation } from "@tanstack/react-query";
import { toastr } from "react-redux-toastr";
import { download } from "snu-lib";
import { fetchAttestation } from "../../repo";

export default function MesAttestations() {
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
    <div className="max-w-6xl px-3 mx-auto">
      <h2 className="font-bold mx-0 mt-12">Mes attestations</h2>

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
                <PopoverPanel anchor="bottom" className="flex flex-col bg-white py-1 rounded shadow-nina">
                  <button
                    onClick={() => downloadAttestation.mutate("2")}
                    disabled={downloadAttestation.isLoading}
                    className="px-2 py-1 hover:bg-blue-600 hover:text-white w-full text-left">
                    {downloadAttestation.isPending ? "Téléchargement en cours..." : "Télécharger"}
                  </button>
                  <button
                    onClick={() => sendAttestation.mutate("2")}
                    disabled={sendAttestation.isLoading}
                    className="px-2 py-1 hover:bg-blue-600 hover:text-white w-full text-left">
                    Envoyer par email
                  </button>
                </PopoverPanel>
              </Popover>
            </div>
          </div>

          <div className="flex gap-2 px-3 pt-[0.75rem] md:p-0">
            <RiAttachmentLine className="text-gray-400 text-xl pt-1 flex-none" />
            <div>
              <p>Attestation de réalisation SNU</p>
              <Popover className="relative">
                <PopoverButton className="text-blue-600">
                  Télécharger
                  <HiChevronDown className="inline-block text-xl" />
                </PopoverButton>
                <PopoverPanel anchor="bottom" className="flex flex-col bg-white py-1 rounded shadow-nina">
                  <button
                    onClick={() => downloadAttestation.mutate("snu")}
                    disabled={downloadAttestation.isLoading}
                    className="px-2 py-1 hover:bg-blue-600 hover:text-white w-full text-left">
                    {downloadAttestation.isPending ? "Téléchargement en cours..." : "Télécharger"}
                  </button>
                  <button
                    onClick={() => sendAttestation.mutate("snu")}
                    disabled={sendAttestation.isLoading}
                    className="px-2 py-1 hover:bg-blue-600 hover:text-white w-full text-left">
                    Envoyer par email
                  </button>
                </PopoverPanel>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
