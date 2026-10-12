import React, { useState } from "react";
import useAuth from "@/services/useAuth";
import Modal from "../../../components/ui/modals/Modal";
import API from "../../../services/api";
import { CDN_BASE_URL } from "@/config";
import { HiOutlineDownload } from "react-icons/hi";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { useQuery } from "@tanstack/react-query";
import { SessionPhase1Type } from "snu-lib";

const MedicalFileModal = ({ isOpen, onClose, onClick = () => {}, title = "Transmettez votre fiche sanitaire" }) => {
  const [loading, setLoading] = useState(false);
  const { young } = useAuth();
  const { data: session } = useQuery({
    queryKey: ["session", young._id],
    queryFn: async (): Promise<SessionPhase1Type> => {
      const { ok, data, code } = await API.get(`/young/${young._id}/session/`);
      if (!ok) throw new Error(code);
      return data;
    },
    enabled: !!young._id,
  });
  const email = session?.sanitaryContactEmail;

  const handleClick = async () => {
    if (onClick) {
      setLoading(true);
      await onClick();
      setLoading(false);
    }
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <h2 className="font-medium text-gray-800 text-xl text-center m-0">{title}</h2>
      <ul className="mt-3">
        <li className="flex px-3 py-2 gap-3">
          <div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-sm text-gray-700">1</span>
          </div>
          <div>
            <p className="text-sm text-gray-800 font-bold">Télécharger la fiche sanitaire et la faire compléter</p>
            <p className="text-xs text-gray-700 leading-relaxed">par l'un de vos représentants légaux</p>
            <div className="mt-2 flex flex-col md:flex-row gap-2 text-gray-700">
              <a
                href={`${CDN_BASE_URL}/file/fiche-sanitaire-2024.pdf`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 border rounded-md p-2 justify-center text-sm text-gray-700 hover:text-gray-700 hover:bg-gray-50">
                <HiOutlineDownload className="mr-1 h-5 w-5 text-gray-500 flex-none" />
                Télécharger
              </a>
            </div>
          </div>
        </li>
        <li className="mt-1 flex px-3 py-2 gap-3">
          <div>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 text-sm text-gray-700">2</span>
          </div>
          <div>
            <p className="text-sm text-gray-800 font-bold">Se munir des documents annexes</p>
            <p className="text-xs text-gray-700 leading-relaxed">
              mentionnés dans la fiche sanitaire (attestation de vaccination, attestation de sécurité sociale, documents éventuels...)
            </p>
          </div>
        </li>

        {email ? (
          <>
            <li className="flex bg-blue-50 rounded-xl px-3 py-4 mt-3 gap-3">
              <div>
                <span className="flex h-8 w-8 bg-white shrink-0 items-center justify-center rounded-full border border-gray-300 text-sm text-gray-700">3</span>
              </div>
              <div>
                <p className="bg-[#DBEAFE] w-fit rounded-sm px-1.5 text-xs text-[#1E40AF] font-medium">Avant le départ</p>
                <p className="text-sm text-gray-800 font-bold">Envoyer l'ensemble des documents par e-mail</p>
                <p className="text-xs text-gray-700 leading-relaxed">
                  à{" "}
                  <a href={`mailto:${email}`} className="text-blue-600 underline underline-offset-2 break-normal">
                    <span className="inline-block underline-none text-sm">{email}</span>
                  </a>{" "}
                </p>
              </div>
            </li>
            <li className="flex bg-blue-50 rounded-xl px-3 py-4 mt-3 gap-3">
              <div>
                <span className="flex h-8 w-8 bg-white shrink-0 items-center justify-center rounded-full border border-gray-300 text-sm text-gray-700">4</span>
              </div>
              <div>
                <p className="bg-[#DBEAFE] w-fit rounded-sm px-1.5 text-xs text-[#1E40AF] font-medium">Le jour du départ</p>
                <p className="text-sm text-gray-800 font-bold">Remettre l’ensemble des documents en mains propres</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  à l’équipe d’encadrement, dans une enveloppe portant la mention <i>“À l’attention du référent sanitaire, Pli Confidentiel”</i>.
                </p>
              </div>
            </li>
          </>
        ) : (
          <li className="flex bg-blue-50 rounded-xl px-3 py-4 mt-3 gap-3">
            <div>
              <span className="flex h-8 w-8 bg-white shrink-0 items-center justify-center rounded-full border border-gray-300 text-sm text-gray-700">3</span>
            </div>
            <div>
              <p className="bg-[#DBEAFE] w-fit rounded-sm px-1.5 text-xs text-[#1E40AF] font-medium">Le jour du départ</p>
              <p className="text-sm text-gray-800 font-bold">Remettre l’ensemble des documents en mains propres</p>
              <p className="text-xs text-gray-600 leading-relaxed">
                à l’équipe d’encadrement à l’arrivée au séjour, dans une enveloppe portant la mention <i>“À l’attention du référent sanitaire, Pli Confidentiel”</i>.
              </p>
            </div>
          </li>
        )}
      </ul>

      <ButtonPrimary onClick={handleClick} disabled={loading} className="mt-6 w-full">
        {loading ? "Chargement" : "J'ai compris"}
      </ButtonPrimary>
    </Modal>
  );
};

export default MedicalFileModal;
