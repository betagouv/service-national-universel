import { copyToClipboard } from "@/utils";
import { Container, InputText } from "@snu/ds/admin";
import React, { useState } from "react";
import { HiCheckCircle } from "react-icons/hi";
import { MdOutlineContentCopy } from "react-icons/md";

export interface ReferentDisplay {
  nom?: string;
  prenom?: string;
  email?: string;
}

interface Props {
  currentReferent: ReferentDisplay | undefined;
}

export default function ReferentInfos({ currentReferent }: Props) {
  const [copied, setCopied] = useState<boolean>(false);

  return (
    <Container title="Référent de classe">
      <div className="flex items-stretch justify-stretch">
        <div className="flex-1">
          <InputText name="refName" className="mb-3" value={currentReferent?.nom || ""} label={"Nom"} readOnly disabled />
          <InputText name="refFirstName" className="mb-3" value={currentReferent?.prenom || ""} label={"Prénom"} readOnly disabled />
        </div>
        <div className="mx-14 w-[1px] bg-gray-200 shrink-0">&nbsp;</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <InputText name="refMail" className="mb-3 w-[95%]" label={"Adresse Email"} value={currentReferent?.email || ""} readOnly disabled />
            <div
              className="flex items-center mb-3"
              onClick={() => {
                copyToClipboard(currentReferent?.email);
                setCopied(true);
                setTimeout(() => {
                  setCopied(false);
                }, 2000);
              }}>
              {copied ? <HiCheckCircle className="text-green-500 ml-2" /> : <MdOutlineContentCopy size={20} className="ml-2 text-gray-400 cursor-pointer" />}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
